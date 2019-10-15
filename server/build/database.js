"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = __importStar(require("sqlite3"));
function dbInit() {
    sqlite3.verbose();
    var db = new sqlite3.Database('merchantpunk.db');
    db.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), password VARCHAR(255), UNIQUE(username));');
    db.run('CREATE TABLE IF NOT EXISTS saves (username VARCHAR(255), savename VARCHAR(255), savedata VARCHAR(100000), UNIQUE(savename))');
    db.close();
}
dbInit();
