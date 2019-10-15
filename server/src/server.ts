import * as sqlite3 from "sqlite3";

const express = require('express');
const cors = require('cors');

let app = express();

app.use(cors());
app.use(express.json());

app.post('/register', (request, result) => {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('Signup request ' + request.body.nickname);

        sqlite3.verbose();
        let db = new sqlite3.Database('merchantpunk.db');
        let sql = "INSERT INTO users(username, password) VALUES (?, ?)";
        db.run(sql,[request.body.nickname, request.body.password], (err) => {
            db.close();
            if (err) {
                console.log("Cannot add this row, it either already exists in the database or the operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            } else {
                result.sendStatus(200);
            }
        });
    }
});

app.post('/login', (request, result) => {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('Login request ' + request.body.nickname);

        sqlite3.verbose();
        let db = new sqlite3.Database('merchantpunk.db');
        let sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        db.get(sql, [request.body.nickname, request.body.password], (err, row) => {
            db.close();
            if (err) {
                console.log("Operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            }
            if (typeof row == "undefined") {
                console.log("Wrong credentials\n");
                result.sendStatus(404);
            } else {
                result.sendStatus(200);
            }
        });
    }
});

app.post('/addfile', (request, result) => {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('File upload ' + request.body.nickname);
        console.log('File name ' + request.body.savename);
        console.log('File \n' + request.body.savedata.length);

        sqlite3.verbose();
        let db = new sqlite3.Database('merchantpunk.db');
        let sql = "INSERT INTO saves(username, savename, savedata) VALUES (?, ?, ?)";
        db.run(sql, [request.body.nickname, request.body.savename, request.body.savedata], (err) => {
            db.close();
            if(err) {
                console.log("Cannot add this row, it either already exists in the database or the operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            } else {
                result.sendStatus(200);
            }
        });
    }
});

app.post('/getfiles', (request, result) => {
    console.log('Post request!');
    if (request.headers['content-type'] == 'application/json') {
        console.log('File list request');

        sqlite3.verbose();
        let db = new sqlite3.Database('merchantpunk.db');
        let sql = "SELECT username, savename, savedata FROM saves";
        db.all(sql, (err, rows) => {
            db.close();
            if (err) {
                console.log("Operation has failed");
                console.log(err.message);
                result.sendStatus(401);
            } else {
                result.status(200);
                result.send(JSON.stringify(rows));
            }
        });
    }
});

let server = app.listen(8082, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)
});