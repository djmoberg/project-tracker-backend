var express = require('express');
var router = express.Router();

var db = require('../db');

router.post('/register', function (req, res, next) {
    if (req.user) {
        let data = [
            [req.body.name]
        ]
        db.query('INSERT INTO projects (name) VALUES (?)', data, function (err, rows, fields) {
            if (!err) {
                let data2 = [
                    [req.user._id, rows.insertId]
                ]
                db.query('INSERT INTO user_project (user_id, project_id) VALUES (?)', data2, function (err, rows, fields) {
                    if (!err) {
                        res.send("Project added")
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

// router.get('/work', function (req, res, next) {
//     if (req.user) {
//         let data = [req.user.selectedProject]
//         console.log(data)
//         db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ?', data, function (err, rows, fields) {
//             if (!err) {
//                 res.json(rows)
//             }
//             else
//                 console.log(err);
//         });
//     } else {
//         res.send("unauthorized")
//     }
// });

router.get('/:id', function (req, res, next) {
    if (req.user) {
        let data = [req.user._id, req.params.id]
        db.query('SELECT * FROM user_project WHERE user_id = ? AND project_id = ?', data, function (err, rows, fields) {
            if (!err) {
                if (rows.length !== 0) {
                    let data2 = [
                        [req.params.id]
                    ]
                    db.query('SELECT * FROM projects WHERE id = (?)', data2, function (err, rows, fields) {
                        let project = rows[0]
                        let data3 = [req.params.id]
                        if (!err) {
                            db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ?', data3, function (err, rows, fields) {
                                if (!err) {
                                    // req.session.selectedProject = req.params.id
                                    res.json({name: project.name, overview: rows})
                                }
                                else
                                    console.log(err);
                            });
                        }
                        else
                            console.log(err);
                    });
                } else {
                    console.log("unauthorized")
                }
            }
            else
                console.log(err);
        });
    } else {
        res.send("unauthorized")
    }
});

module.exports = router;