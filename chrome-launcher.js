/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var childProcess = require("child_process");
var fs = require("fs");
var chromeFinder = require("./chrome-finder");
var random_port_1 = require("./random-port");
var flags_1 = require("./flags");
var utils_1 = require("./utils");
var net = require("net");
var rimraf = require('rimraf');
var log = require('lighthouse-logger');
var spawn = childProcess.spawn;
var execSync = childProcess.execSync;
var isWindows = process.platform === 'win32';
var _SIGINT = 'SIGINT';
var _SIGINT_EXIT_CODE = 130;
var _SUPPORTED_PLATFORMS = new Set(['darwin', 'linux', 'win32']);
function launch(opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var instance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts.handleSIGINT = utils_1.defaults(opts.handleSIGINT, true);
                    instance = new Launcher(opts);
                    // Kill spawned Chrome process in case of ctrl-C.
                    if (opts.handleSIGINT) {
                        process.on(_SIGINT, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, instance.kill()];
                                    case 1:
                                        _a.sent();
                                        process.exit(_SIGINT_EXIT_CODE);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    return [4 /*yield*/, instance.launch()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { pid: instance.pid, port: instance.port, kill: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, instance.kill()];
                            }); }); } }];
            }
        });
    });
}
exports.launch = launch;
var Launcher = (function () {
    function Launcher(opts, moduleOverrides) {
        if (opts === void 0) { opts = {}; }
        if (moduleOverrides === void 0) { moduleOverrides = {}; }
        this.opts = opts;
        this.tmpDirandPidFileReady = false;
        this.pollInterval = 500;
        this.fs = moduleOverrides.fs || fs;
        this.rimraf = moduleOverrides.rimraf || rimraf;
        this.spawn = moduleOverrides.spawn || spawn;
        log.setLevel(utils_1.defaults(this.opts.logLevel, 'silent'));
        // choose the first one (default)
        this.startingUrl = utils_1.defaults(this.opts.startingUrl, 'about:blank');
        this.chromeFlags = utils_1.defaults(this.opts.chromeFlags, []);
        this.requestedPort = utils_1.defaults(this.opts.port, 0);
        this.chromePath = this.opts.chromePath;
    }
    Object.defineProperty(Launcher.prototype, "flags", {
        get: function () {
            var flags = flags_1.DEFAULT_FLAGS.concat([
                "--remote-debugging-port=" + this.port,
                // Place Chrome profile in a custom location we'll rm -rf later
                "--user-data-dir=" + this.userDataDir
            ]);
            if (process.platform === 'linux') {
                flags.push('--disable-setuid-sandbox');
                flags.push('--no-sandbox');
            }
            flags.push.apply(flags, this.chromeFlags);
            flags.push(this.startingUrl);
            return flags;
        },
        enumerable: true,
        configurable: true
    });
    // Wrapper function to enable easy testing.
    Launcher.prototype.makeTmpDir = function () {
        return utils_1.makeTmpDir();
    };
    Launcher.prototype.prepare = function () {
        var platform = process.platform;
        if (!_SUPPORTED_PLATFORMS.has(platform)) {
            throw new Error("Platform " + platform + " is not supported");
        }
        this.userDataDir = this.opts.userDataDir || this.makeTmpDir();
        this.outFile = this.fs.openSync(this.userDataDir + "/chrome-out.log", 'a');
        this.errFile = this.fs.openSync(this.userDataDir + "/chrome-err.log", 'a');
        // fix for Node4
        // you can't pass a fd to fs.writeFileSync
        this.pidFile = this.userDataDir + "/chrome.pid";
        this.portFile = this.userDataDir + "/chrome.port";
        log.verbose('ChromeLauncher', "created " + this.userDataDir);
        this.tmpDirandPidFileReady = true;
    };
    Launcher.prototype.launch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1, installations, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.requestedPort !== 0)) return [3 /*break*/, 4];
                        this.port = this.requestedPort;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.isDebuggerReady()];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        err_1 = _b.sent();
                        log.log('ChromeLauncher', "No debugging port found on port " + this.port + ", launching a new Chrome.");
                        return [3 /*break*/, 4];
                    case 4:
                        if (!this.tmpDirandPidFileReady) {
                            this.prepare();
                        }
                        if (!(this.chromePath === undefined)) return [3 /*break*/, 6];
                        return [4 /*yield*/, chromeFinder[process.platform]()];
                    case 5:
                        installations = _b.sent();
                        if (installations.length === 0) {
                            throw new Error('No Chrome Installations Found');
                        }
                        this.chromePath = installations[0];
                        _b.label = 6;
                    case 6:
                        _a = this;
                        return [4 /*yield*/, this.spawnProcess(this.chromePath)];
                    case 7:
                        _a.pid = _b.sent();
                        return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    Launcher.prototype.spawnProcess = function (execPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var pid_1, port, spawnPromise, pid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            pid_1 = fs.readFileSync(this.pidFile, { encoding: 'utf-8' });
                            port = fs.readFileSync(this.portFile, { encoding: 'utf-8' });
                            this.pid = Number(pid_1);
                            this.port = Number(port);
                            return [2 /*return*/, this.pid];
                        }
                        catch (e) {
                            // Stub.
                        }
                        spawnPromise = new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, chrome;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (this.chrome) {
                                            log.log('ChromeLauncher', "Chrome already running with pid " + this.chrome.pid + ".");
                                            return [2 /*return*/, resolve(this.chrome.pid)];
                                        }
                                        if (!(this.requestedPort === 0)) return [3 /*break*/, 2];
                                        _a = this;
                                        return [4 /*yield*/, random_port_1.getRandomPort()];
                                    case 1:
                                        _a.port = _b.sent();
                                        _b.label = 2;
                                    case 2:
                                        log.verbose('ChromeLauncher', "Launching with command:\n\"" + execPath + "\" " + this.flags.join(' '));
                                        chrome = this.spawn(execPath, this.flags, { detached: true, stdio: ['ignore', this.outFile, this.errFile] });
                                        this.chrome = chrome;
                                        this.fs.writeFileSync(this.portFile, this.port);
                                        this.fs.writeFileSync(this.pidFile, chrome.pid.toString());
                                        log.verbose('ChromeLauncher', "Chrome running with pid " + chrome.pid + " on port " + this.port + ".");
                                        resolve(chrome.pid);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, spawnPromise];
                    case 1:
                        pid = _a.sent();
                        return [4 /*yield*/, this.waitUntilReady()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, pid];
                }
            });
        });
    };
    Launcher.prototype.cleanup = function (client) {
        if (client) {
            client.removeAllListeners();
            client.end();
            client.destroy();
            client.unref();
        }
    };
    // resolves if ready, rejects otherwise
    Launcher.prototype.isDebuggerReady = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var client = net.createConnection(_this.port);
            client.once('error', function (err) {
                _this.cleanup(client);
                reject(err);
            });
            client.once('connect', function () {
                _this.cleanup(client);
                resolve();
            });
        });
    };
    // resolves when debugger is ready, rejects after 10 polls
    Launcher.prototype.waitUntilReady = function () {
        var _this = this;
        var launcher = this;
        return new Promise(function (resolve, reject) {
            var retries = 0;
            var waitStatus = 'Waiting for browser.';
            var poll = function () {
                if (retries === 0) {
                    log.log('ChromeLauncher', waitStatus);
                }
                retries++;
                waitStatus += '..';
                log.log('ChromeLauncher', waitStatus);
                launcher.isDebuggerReady()
                    .then(function () {
                    log.log('ChromeLauncher', waitStatus + ("" + log.greenify(log.tick)));
                    resolve();
                })
                    .catch(function (err) {
                    if (retries > 10) {
                        log.error('ChromeLauncher', err.message);
                        var stderr = _this.fs.readFileSync(_this.userDataDir + "/chrome-err.log", { encoding: 'utf-8' });
                        log.error('ChromeLauncher', "Logging contents of " + _this.userDataDir + "/chrome-err.log");
                        log.error('ChromeLauncher', stderr);
                        fs.unlinkSync(_this.pidFile);
                        fs.unlinkSync(_this.portFile);
                        return reject(err);
                    }
                    utils_1.delay(launcher.pollInterval).then(poll);
                });
            };
            poll();
        });
    };
    Launcher.prototype.kill = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.chrome) {
                _this.chrome.on('close', function () {
                    _this.destroyTmp().then(resolve);
                });
                log.log('ChromeLauncher', 'Killing all Chrome Instances');
                try {
                    if (isWindows) {
                        execSync("taskkill /pid " + _this.chrome.pid + " /T /F");
                    }
                    else {
                        process.kill(-_this.chrome.pid);
                    }
                    fs.unlinkSync(_this.pidFile);
                    fs.unlinkSync(_this.portFile);
                }
                catch (err) {
                    log.warn('ChromeLauncher', "Chrome could not be killed " + err.message);
                }
                delete _this.chrome;
            }
            else {
                // fail silently as we did not start chrome
                resolve();
            }
        });
    };
    Launcher.prototype.destroyTmp = function () {
        var _this = this;
        return new Promise(function (resolve) {
            // Only clean up the tmp dir if we created it.
            if (_this.userDataDir === undefined || _this.opts.userDataDir !== undefined) {
                return resolve();
            }
            if (_this.outFile) {
                _this.fs.closeSync(_this.outFile);
                delete _this.outFile;
            }
            if (_this.errFile) {
                _this.fs.closeSync(_this.errFile);
                delete _this.errFile;
            }
            _this.rimraf(_this.userDataDir, function () { return resolve(); });
        });
    };
    return Launcher;
}());
exports.Launcher = Launcher;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hyb21lLWxhdW5jaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2hyb21lLWxhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFYiw0Q0FBOEM7QUFDOUMsdUJBQXlCO0FBQ3pCLDhDQUFnRDtBQUNoRCw2Q0FBNEM7QUFDNUMsaUNBQXNDO0FBQ3RDLGlDQUFvRDtBQUNwRCx5QkFBMkI7QUFDM0IsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3pDLElBQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFDakMsSUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztBQUN2QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQztBQUMvQyxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUM7QUFDekIsSUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUM7QUFDOUIsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQTBCbkUsZ0JBQTZCLElBQWtCO0lBQWxCLHFCQUFBLEVBQUEsU0FBa0I7OztZQUd2QyxRQUFROzs7O29CQUZkLElBQUksQ0FBQyxZQUFZLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDOytCQUVyQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBRW5DLGlEQUFpRDtvQkFDakQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FB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