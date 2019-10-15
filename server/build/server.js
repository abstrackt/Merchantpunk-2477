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
var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());
app.use(express.json());
app.post('/register', function (request, result) {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('Signup request ' + request.body.nickname);
        sqlite3.verbose();
        var db_1 = new sqlite3.Database('merchantpunk.db');
        var sql = "INSERT INTO users(username, password) VALUES (?, ?)";
        db_1.run(sql, [request.body.nickname, request.body.password], function (err) {
            db_1.close();
            if (err) {
                console.log("Cannot add this row, it either already exists in the database or the operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            }
            else {
                result.sendStatus(200);
            }
        });
    }
});
app.post('/login', function (request, result) {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('Login request ' + request.body.nickname);
        sqlite3.verbose();
        var db_2 = new sqlite3.Database('merchantpunk.db');
        var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        db_2.get(sql, [request.body.nickname, request.body.password], function (err, row) {
            db_2.close();
            if (err) {
                console.log("Operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            }
            if (typeof row == "undefined") {
                console.log("Wrong credentials\n");
                result.sendStatus(404);
            }
            else {
                result.sendStatus(200);
            }
        });
    }
});
app.post('/addfile', function (request, result) {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('File upload ' + request.body.nickname);
        console.log('File name ' + request.body.savename);
        console.log('File \n' + request.body.savedata.length);
        sqlite3.verbose();
        var db_3 = new sqlite3.Database('merchantpunk.db');
        var sql = "INSERT INTO saves(username, savename, savedata) VALUES (?, ?, ?)";
        db_3.run(sql, [request.body.nickname, request.body.savename, request.body.savedata], function (err) {
            db_3.close();
            if (err) {
                console.log("Cannot add this row, it either already exists in the database or the operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            }
            else {
                result.sendStatus(200);
            }
        });
    }
});
app.post('/getfiles', function (request, result) {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('File list request');
        sqlite3.verbose();
        var db_4 = new sqlite3.Database('merchantpunk.db');
        var sql = "SELECT username, savename, savedata FROM saves";
        db_4.all(sql, function (err, rows) {
            db_4.close();
            if (err) {
                console.log("Operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            }
            else {
                result.status(200);
                result.send(JSON.stringify(rows));
            }
        });
    }
});
var server = app.listen(8082, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
