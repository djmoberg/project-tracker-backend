var express = require('express');
var router = express.Router();

var db = require('../db');

router.get('/', (req, res, next) => {
    if (req.user) {
        let data = [req.user._id, req.session.selectedProject]
        db.query('SELECT startTime FROM workTimers WHERE user_id = ? AND project_id = ?', data, (err, rows, fields) => {
            if (!err) {
                if (rows.length !== 0) {
                    res.json(rows[0])
                } else {
                    res.send({ startTime: 0 })
                }
            } else {
                console.log(err)
            }
        })
    } else {
        res.send("unauthorized")
    }
})

router.post('/new', (req, res, next) => {
    if (req.user) {
        let data = [[req.user._id, req.session.selectedProject, req.body.startTime]]
        db.query('INSERT INTO workTimers (user_id, project_id, startTime) VALUES (?)', data, (err, rows, fields) => {
            if (!err)
                res.send("Timer added")
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

router.delete('/', (req, res, next) => {
    if (req.user) {
        let data = [req.user._id, req.session.selectedProject]
        db.query('DELETE FROM workTimers WHERE user_id = ? AND project_id = ?', data, (err, rows, fields) => {
            if (!err)
                res.json({ msg: "Timer deleted" })
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

module.exports = router;