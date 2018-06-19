var express = require('express');
var router = express.Router();

var db = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', function (req, res, next) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        let data = [
            [req.body.username, hash]
        ]
        db.query('INSERT INTO users (name, password) VALUES (?)', data, function (err, rows, fields) {
            if (!err) {
                res.send("User added")
            }
            else
                console.log(err);
        });

        // db.end();
    });
});

router.get('/exists/:username', function (req, res, next) {
    let data = [
        [req.params.username]
    ]
    db.query('SELECT name FROM users WHERE name = (?)', data, function (err, rows, fields) {
        if (!err) {
            if (rows.length === 0)
                res.send(false)
            else
                res.send(true)
        }
        else
            console.log(err);
    });
});

module.exports = router;