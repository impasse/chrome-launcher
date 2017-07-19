/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
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
var path_1 = require("path");
var child_process_1 = require("child_process");
var mkdirp = require("mkdirp");
function defaults(val, def) {
    return typeof val === 'undefined' ? def : val;
}
exports.defaults = defaults;
function delay(time) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
        });
    });
}
exports.delay = delay;
function makeTmpDir() {
    switch (process.platform) {
        case 'darwin':
        case 'linux':
            return makeUnixTmpDir();
        case 'win32':
            return makeWin32TmpDir();
        default:
            throw new Error("Platform " + process.platform + " is not supported");
    }
}
exports.makeTmpDir = makeTmpDir;
function makeUnixTmpDir() {
    return child_process_1.execSync('mktemp -d -t lighthouse.XXXXXXX').toString().trim();
}
function makeWin32TmpDir() {
    var winTmpPath = process.env.TEMP || process.env.TMP ||
        (process.env.SystemRoot || process.env.windir) + '\\temp';
    var randomNumber = Math.floor(Math.random() * 9e7 + 1e7);
    var tmpdir = path_1.join(winTmpPath, 'lighthouse.' + randomNumber);
    mkdirp.sync(tmpdir);
    return tmpdir;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBQ0gsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsNkJBQTBCO0FBQzFCLCtDQUF1QztBQUN2QywrQkFBaUM7QUFFakMsa0JBQTRCLEdBQWtCLEVBQUUsR0FBTTtJQUNwRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDaEQsQ0FBQztBQUZELDRCQUVDO0FBRUQsZUFBNEIsSUFBWTs7O1lBQ3RDLHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxFQUFDOzs7Q0FDMUQ7QUFGRCxzQkFFQztBQUVEO0lBQ0UsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekIsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLE9BQU87WUFDVixNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsS0FBSyxPQUFPO1lBQ1YsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFZLE9BQU8sQ0FBQyxRQUFRLHNCQUFtQixDQUFDLENBQUM7SUFDckUsQ0FBQztBQUNILENBQUM7QUFWRCxnQ0FVQztBQUVEO0lBQ0UsTUFBTSxDQUFDLHdCQUFRLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2RSxDQUFDO0FBRUQ7SUFDRSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUc7UUFDbEQsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUM5RCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDM0QsSUFBTSxNQUFNLEdBQUcsV0FBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLEdBQUcsWUFBWSxDQUFDLENBQUM7SUFFOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUMifQ==