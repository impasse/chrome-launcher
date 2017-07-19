/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var execFileSync = require('child_process').execFileSync;
var log = require('lighthouse-logger');
var newLineRegex = /\r?\n/;
function darwin() {
    var suffixes = ['/Contents/MacOS/Google Chrome Canary', '/Contents/MacOS/Google Chrome'];
    var LSREGISTER = '/System/Library/Frameworks/CoreServices.framework' +
        '/Versions/A/Frameworks/LaunchServices.framework' +
        '/Versions/A/Support/lsregister';
    var installations = [];
    var customChromePath = resolveChromePath();
    if (customChromePath) {
        installations.push(customChromePath);
    }
    execSync(LSREGISTER + " -dump" +
        ' | grep -i \'google chrome\\( canary\\)\\?.app$\'' +
        ' | awk \'{$1=""; print $0}\'')
        .toString()
        .split(newLineRegex)
        .forEach(function (inst) {
        suffixes.forEach(function (suffix) {
            var execPath = path.join(inst.trim(), suffix);
            if (canAccess(execPath)) {
                installations.push(execPath);
            }
        });
    });
    // Retains one per line to maintain readability.
    // clang-format off
    var priorities = [
        { regex: new RegExp("^" + process.env.HOME + "/Applications/.*Chrome.app"), weight: 50 },
        { regex: new RegExp("^" + process.env.HOME + "/Applications/.*Chrome Canary.app"), weight: 51 },
        { regex: /^\/Applications\/.*Chrome.app/, weight: 100 },
        { regex: /^\/Applications\/.*Chrome Canary.app/, weight: 101 },
        { regex: /^\/Volumes\/.*Chrome.app/, weight: -2 },
        { regex: /^\/Volumes\/.*Chrome Canary.app/, weight: -1 },
        { regex: new RegExp(process.env.LIGHTHOUSE_CHROMIUM_PATH), weight: 150 },
        { regex: new RegExp(process.env.CHROME_PATH), weight: 151 }
    ];
    // clang-format on
    return sort(installations, priorities);
}
exports.darwin = darwin;
function resolveChromePath() {
    if (canAccess(process.env.CHROME_PATH)) {
        return process.env.CHROME_PATH;
    }
    if (canAccess(process.env.LIGHTHOUSE_CHROMIUM_PATH)) {
        log.warn('ChromeLauncher', 'LIGHTHOUSE_CHROMIUM_PATH is deprecated, use CHROME_PATH env variable instead.');
        return process.env.LIGHTHOUSE_CHROMIUM_PATH;
    }
    return undefined;
}
/**
 * Look for linux executables in 3 ways
 * 1. Look into CHROME_PATH env variable
 * 2. Look into the directories where .desktop are saved on gnome based distro's
 * 3. Look for google-chrome-stable & google-chrome executables by using the which command
 */
function linux() {
    var installations = [];
    // 1. Look into CHROME_PATH env variable
    var customChromePath = resolveChromePath();
    if (customChromePath) {
        installations.push(customChromePath);
    }
    // 2. Look into the directories where .desktop are saved on gnome based distro's
    var desktopInstallationFolders = [
        path.join(require('os').homedir(), '.local/share/applications/'),
        '/usr/share/applications/',
    ];
    desktopInstallationFolders.forEach(function (folder) {
        installations = installations.concat(findChromeExecutables(folder));
    });
    // Look for google-chrome-stable & google-chrome executables by using the which command
    var executables = [
        'google-chrome-stable',
        'google-chrome',
    ];
    executables.forEach(function (executable) {
        try {
            var chromePath = execFileSync('which', [executable]).toString().split(newLineRegex)[0];
            if (canAccess(chromePath)) {
                installations.push(chromePath);
            }
        }
        catch (e) {
            // Not installed.
        }
    });
    if (!installations.length) {
        throw new Error('The environment variable CHROME_PATH must be set to ' +
            'executable of a build of Chromium version 54.0 or later.');
    }
    var priorities = [
        { regex: /chrome-wrapper$/, weight: 51 }, { regex: /google-chrome-stable$/, weight: 50 },
        { regex: /google-chrome$/, weight: 49 },
        { regex: new RegExp(process.env.LIGHTHOUSE_CHROMIUM_PATH), weight: 100 },
        { regex: new RegExp(process.env.CHROME_PATH), weight: 101 }
    ];
    return sort(uniq(installations.filter(Boolean)), priorities);
}
exports.linux = linux;
function win32() {
    var installations = [];
    var suffixes = [
        '\\Google\\Chrome SxS\\Application\\chrome.exe', '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];
    var customChromePath = resolveChromePath();
    if (customChromePath) {
        installations.push(customChromePath);
    }
    prefixes.forEach(function (prefix) { return suffixes.forEach(function (suffix) {
        var chromePath = path.join(prefix, suffix);
        if (canAccess(chromePath)) {
            installations.push(chromePath);
        }
    }); });
    return installations;
}
exports.win32 = win32;
function sort(installations, priorities) {
    var defaultPriority = 10;
    return installations
        .map(function (inst) {
        for (var _i = 0, priorities_1 = priorities; _i < priorities_1.length; _i++) {
            var pair = priorities_1[_i];
            if (pair.regex.test(inst)) {
                return { path: inst, weight: pair.weight };
            }
        }
        return { path: inst, weight: defaultPriority };
    })
        .sort(function (a, b) { return (b.weight - a.weight); })
        .map(function (pair) { return pair.path; });
}
function canAccess(file) {
    if (!file) {
        return false;
    }
    try {
        fs.accessSync(file);
        return true;
    }
    catch (e) {
        return false;
    }
}
function uniq(arr) {
    return Array.from(new Set(arr));
}
function findChromeExecutables(folder) {
    var argumentsRegex = /(^[^ ]+).*/; // Take everything up to the first space
    var chromeExecRegex = '^Exec=\/.*\/(google|chrome|chromium)-.*';
    var installations = [];
    if (canAccess(folder)) {
        // Output of the grep & print looks like:
        //    /opt/google/chrome/google-chrome --profile-directory
        //    /home/user/Downloads/chrome-linux/chrome-wrapper %U
        var execPaths = execSync("grep -ER \"" + chromeExecRegex + "\" " + folder + " | awk -F '=' '{print $2}'")
            .toString()
            .split(newLineRegex)
            .map(function (execPath) { return execPath.replace(argumentsRegex, '$1'); });
        execPaths.forEach(function (execPath) { return canAccess(execPath) && installations.push(execPath); });
    }
    return installations;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hyb21lLWZpbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNocm9tZS1maW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILFlBQVksQ0FBQzs7QUFFYixJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDbkQsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUMzRCxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUV6QyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFJN0I7SUFDRSxJQUFNLFFBQVEsR0FBRyxDQUFDLHNDQUFzQyxFQUFFLCtCQUErQixDQUFDLENBQUM7SUFFM0YsSUFBTSxVQUFVLEdBQUcsbURBQW1EO1FBQ2xFLGlEQUFpRDtRQUNqRCxnQ0FBZ0MsQ0FBQztJQUVyQyxJQUFNLGFBQWEsR0FBa0IsRUFBRSxDQUFDO0lBRXhDLElBQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztJQUM3QyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDckIsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxRQUFRLENBQ0QsVUFBVSxXQUFRO1FBQ3JCLG1EQUFtRDtRQUNuRCw4QkFBOEIsQ0FBQztTQUM5QixRQUFRLEVBQUU7U0FDVixLQUFLLENBQUMsWUFBWSxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxVQUFDLElBQVk7UUFDcEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07WUFDckIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElB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