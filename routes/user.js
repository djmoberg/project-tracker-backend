var express = require('express');
var router = express.Router();

var db = require('../db');
const bcrypt = require('bcrypt');
var email = require('../email')

router.post('/register', function (req, res, next) {
    email.send({
        from: '"Facelex" <noreply@facelex.com>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Velkommen', // Subject line
        text: 'Velkommen til Facelex!', // plain text body
    })

    bcrypt.hash(req.body.password, 10, function (err, hash) {
        let data = [
            [req.body.username, hash, req.body.email]
        ]
        db.query('INSERT INTO users (name, password, email) VALUES (?)', data, function (err, rows, fields) {
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

router.put('/newPassword', (req, res, next) => {
    if (req.user) {
        bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            let data = [hash, req.user._id]
            db.query('UPDATE users SET password = ? WHERE id = ?', data, (err, rows, fields) => {
                if (!err) {
                    res.send("New password")
                } else {
                    console.log(err)
                }
            })
        })
    } else {
        res.send("unauthorized")
    }
})

router.post('/sendNewPassword', (req, res, next) => {
    require('crypto').randomBytes(4, (err, buffer) => {
        let newPass = buffer.toString('hex')

        email.send({
            from: '"Facelex" <noreply@facelex.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Nytt passord', // Subject line
            text: 'Ditt nye passord er: ' + newPass, // plain text body
        })

        bcrypt.hash(newPass, 10, function (err, hash) {
            let data = [hash, req.body.email]
            db.query('UPDATE users SET password = ? WHERE email = ?', data, (err, rows, fields) => {
                if (!err)
                    res.send("New password sent")
                else
                    console.log(err)
            })
        })
    })
})

router.get('/pendingJoinRequests', (req, res, next) => {
    if (req.user) {
        let data = [req.user._id]
        db.query('SELECT projects.id, projects.name FROM request_project INNER JOIN projects ON request_project.project_id = projects.id WHERE request_project.user_id = ?', data, (err, rows, fields) => {
            if (!err)
                res.json(rows)
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

router.delete('/pendingJoinRequest', (req, res, next) => {
    if (req.user) {
        let data = [req.user._id, req.body.projectId]
        db.query('DELETE FROM request_project WHERE user_id = ? AND project_id = ?', data, (err, rows, fields) => {
            if (!err)
                res.send("Request deleted")
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

module.exports = router;