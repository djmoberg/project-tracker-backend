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
                req.body.addedUsers.every((user) => {
                    let userData = [[user, req.session.selectedProject, req.body.workDate, req.body.workFrom, req.body.workTo, req.body.comment]]
                    db.query('INSERT INTO work (user, project, workDate, workFrom, workTo, comment) VALUES (?)', userData, function (err, rows, fields) {
                        if (!err)
                            return true
                        else {
                            console.log(err)
                            return false
                        }
                    })
                })
                let data2 = [req.session.selectedProject]
                db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ? ORDER BY work.workDate DESC', data2, function (err, rows, fields) {
                    if (!err) {
                        res.json({ status: "Work added", overview: rows })
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

router.put('/edit', (req, res, next) => {
    if (req.user) { //TODO sjekke om arbeidet tilhører brukeren?
        let data = [req.body.workDate, req.body.workFrom, req.body.workTo, req.body.comment, req.body.id, req.session.selectedProject]
        db.query('UPDATE work SET workDate = ?, workFrom = ?, workTo = ?, comment = ? WHERE id = ? AND project = ?', data, (err, rows, fields) => {
            if (!err) {
                let data2 = [req.session.selectedProject]
                db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ? ORDER BY work.workDate DESC', data2, function (err, rows, fields) {
                    if (!err) {
                        res.json({ status: "Work edited", overview: rows })
                    }
                    else
                        console.log(err);
                });
            } else {
                console.log(err)
            }
        })
    } else {
        res.send("unauthorized")
    }
})

router.delete('/delete', (req, res, next) => {
    if (req.user) { //TODO sjekke om arbeidet tilhører brukeren?
        let data = [req.body.id, req.session.selectedProject]
        db.query('DELETE FROM work WHERE id = ? AND project = ?', data, (err, rows, fields) => {
            if (!err) {
                let data2 = [req.session.selectedProject]
                db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ? ORDER BY work.workDate DESC', data2, function (err, rows, fields) {
                    if (!err) {
                        res.json({ status: "Work deleted", overview: rows })
                    }
                    else
                        console.log(err);
                });
            } else {
                console.log(err)
            }
        })
    } else {
        res.send("unauthorized")
    }
})

router.post('/trash', (req, res, next) => {
    if (req.user) {
        let data = [[req.body.id, req.user._id, req.session.selectedProject, req.body.workDate, req.body.workFrom, req.body.workTo, req.body.comment]]
        db.query('INSERT INTO deletedWork (id, user, project, workDate, workFrom, workTo, comment) VALUES (?)', data, (err, rows, fields) => {
            if (!err)
                res.send("Work moved")
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

router.get('/deleted', (req, res, next) => {
    if (req.user) {
        let data = [req.user._id, req.session.selectedProject]
        db.query('SELECT * FROM deletedWork WHERE user = ? AND project = ?', data, (err, rows, fields) => {
            if (!err)
                res.json(rows)
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

router.delete('/trash', (req, res, next) => {
    if (req.user) {
        let data = [req.body.id]
        db.query('DELETE FROM deletedWork WHERE id = ?', data, (err, rows, fields) => {
            if (!err)
                res.send("Work deleted")
            else
                console.log(err)
        })
    } else {
        res.send("unauthorized")
    }
})

module.exports = router;