var express = require('express');
var router = express.Router();

// var db = require('../db');
// const bcrypt = require('bcrypt');
var auth = require('../auth')

router.post('/login', auth.authenticate('login'), function (req, res, next) {
    res.send("Logged in")
});

router.get('/logout', function(req, res) {
    req.logout();
    res.send("Logged out")
});

router.get('/loggedIn', function (req, res, next) {
    if (req.user) {
        res.json({"loggedIn": true, "username": req.user.username})
    } else {
        res.json({"loggedIn": false})
    }
});

module.exports = router;