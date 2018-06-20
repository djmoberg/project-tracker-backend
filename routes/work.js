var express = require('express');
var router = express.Router();

var db = require('../db');

router.post('/add', function (req, res, next) {
    if (req.user) {
        let data = [
            [req.user._id, req.session.selectedProject, req.body.workDate, req.body.workFrom, req.body.workTo, req.body.comment]
        ]
        db.query('INSERT INTO work (user, project, workDate, workFrom, workTo, comment) VALUES (?)', data, function (err, rows, fields) {
            if (!err) {
                let data2 = [req.session.selectedProject]
                db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ?', data2, function (err, rows, fields) {
                    if (!err) {
                        res.json({status: "Work added", overview: rows})
                    }
                    else
                        console.log(err);
                });
            }
            else
                console.log(err);
        });
    } else {
        res.send("unauthorized")
    }
});

module.exports = router;