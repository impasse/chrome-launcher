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
var _SIGABRT = 'SIGABRT';
var _SUPPORTED_PLATFORMS = new Set(['darwin', 'linux', 'win32']);
function launch(opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var instance, kill;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts.handleSIGINT = utils_1.defaults(opts.handleSIGINT, true);
                    instance = new Launcher(opts);
                    // Kill spawned Chrome process in case of ctrl-C.
                    if (opts.handleSIGINT) {
                        kill = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, instance.kill()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        process.on(_SIGINT, kill);
                        process.on(_SIGABRT, kill);
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
            var spawnPromise, pid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hyb21lLWxhdW5jaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2hyb21lLWxhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFYiw0Q0FBOEM7QUFDOUMsdUJBQXlCO0FBQ3pCLDhDQUFnRDtBQUNoRCw2Q0FBNEM7QUFDNUMsaUNBQXNDO0FBQ3RDLGlDQUFvRDtBQUNwRCx5QkFBMkI7QUFDM0IsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3pDLElBQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFDakMsSUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztBQUN2QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQztBQUMvQyxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUM7QUFDekIsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBQzNCLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUEwQm5FLGdCQUE2QixJQUFrQjtJQUFsQixxQkFBQSxFQUFBLFNBQWtCOzs7WUFHdkMsUUFBUSxFQUlOLElBQUk7Ozs7b0JBTlosSUFBSSxDQUFDLFlBQVksR0FBRyxnQkFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7K0JBRXJDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQztvQkFFbkMsaURBQWlEO29CQUNqRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzsrQkFDVDs7OzRDQUNYLHFCQUFNLFFB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