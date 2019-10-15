import * as sqlite3 from 'sqlite3';

function dbInit() {
    sqlite3.verbose();
    let db = new sqlite3.Database('merchantpunk.db');
    db.run('CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), password VARCHAR(255), UNIQUE(username));');
    db.run('CREATE TABLE IF NOT EXISTS saves (username VARCHAR(255), savename VARCHAR(255), savedata VARCHAR(100000), UNIQUE(savename))');
    db.close();
}

dbInit();