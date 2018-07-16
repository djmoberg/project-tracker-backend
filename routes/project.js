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
                db.query('INSERT INTO user_project (user_id, project_id) VALUES (?)', data2, function (err, rows2, fields) {
                    if (!err) {
                        db.query('INSERT INTO admin_project (user_id, project_id) VALUES (?)', data2, (err, rows3, fields) => {
                            if (!err)
                                res.send("Project added")
                            else
                                console.log(err)
                        })
                    } else
                        console.log(err);
                });
            } else
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

router.get('/users', (req, res, next) => {
    if (req.user) {
        let isAdmin = req.user.isAdmin.some(id => {
            return parseInt(id, 10) === parseInt(req.session.selectedProject, 10)
        })
        if (isAdmin) {
            let data = [req.session.selectedProject]
            db.query('SELECT users.id, users.name FROM user_project INNER JOIN users ON user_project.user_id = users.id WHERE user_project.project_id = ?', data, (err, rows, fields) => {
                if (!err) {
                    db.query('SELECT user_id FROM admin_project WHERE project_id = ?', data, (err, rows2, fields) => {
                        if (!err) {
                            let users = []
                            rows.forEach(user => {
                                let isAdmin2 = rows2.some(row => {
                                    return parseInt(user.id, 10) === parseInt(row.user_id, 10)
                                })
                                users.push({ name: user.name, isAdmin: isAdmin2 })
                            });
                            res.json(users)
                        } else {
                            console.log(err)
                        }
                    })
                    // res.json(rows)
                } else {
                    console.log(err)
                }
            })
        } else (
            res.send("unauthorized2")
        )
    } else {
        res.send("unauthorized")
    }
})

router.get('/allUsers', (req, res, next) => {
    if (req.user) {
        let data = [req.session.selectedProject]
        db.query('SELECT users.id, users.name FROM user_project INNER JOIN users ON user_project.user_id = users.id WHERE user_project.project_id = ?', data, (err, rows, fields) => {
            if (!err) {
                res.json(rows)
            } else {
                console.log(err)
            }
        })
    } else {
        res.send("unauthorized")
    }
})

router.post('/addUser', (req, res, next) => {
    if (req.user) {
        let isAdmin = req.user.isAdmin.some(id => {
            return parseInt(id, 10) === parseInt(req.session.selectedProject, 10)
        })
        if (isAdmin) {
            let data = [req.body.username]
            db.query('SELECT id FROM users WHERE name = ?', data, (err, rows, fields) => {
                if (!err) {
                    let data2 = [[rows[0].id, req.session.selectedProject]]
                    db.query('INSERT INTO user_project (user_id, project_id) VALUES (?)', data2, (err, rows, fields) => {
                        if (!err) {
                            res.send("User added")
                        } else {
                            console.log(err)
                        }
                    })
                } else {
                    console.log(err)
                }
            })
        } else (
            res.send("unauthorized2")
        )
    } else {
        res.send("unauthorized")
    }
})

router.delete('/removeUser', (req, res, next) => {
    if (req.user) {
        let isAdmin = req.user.isAdmin.some(id => {
            return parseInt(id, 10) === parseInt(req.session.selectedProject, 10)
        })
        if (isAdmin) {
            let data = [req.body.username]
            db.query('SELECT id FROM users WHERE name = ?', data, (err, rows, fields) => {
                if (!err) {
                    let data2 = [rows[0].id, req.session.selectedProject]
                    db.query('DELETE FROM user_project WHERE user_id = ? AND project_id = ?', data2, (err, rows, fields) => {
                        if (!err) {
                            res.send("User removed")
                        } else {
                            console.log(err)
                        }
                    })
                } else {
                    console.log(err)
                }
            })
        } else (
            res.send("unauthorized2")
        )
    } else {
        res.send("unauthorized")
    }
})

router.post('/makeAdmin', (req, res, next) => {
    if (req.user) {
        let isAdmin = req.user.isAdmin.some(id => {
            return parseInt(id, 10) === parseInt(req.session.selectedProject, 10)
        })
        if (isAdmin) {
            let data = [req.body.username]
            db.query('SELECT id FROM users WHERE name = ?', data, (err, rows, fields) => {
                if (!err) {
                    let data2 = [[rows[0].id, req.session.selectedProject]]
                    db.query('INSERT INTO admin_project (user_id, project_id) VALUES (?)', data2, (err, rows, fields) => {
                        if (!err)
                            res.send("New admin")
                        else
                            console.log(err)
                    })
                } else {
                    console.log(err)
                }
            })
        } else {
            res.send("unauthorized")
        }
    } else {
        res.send("unauthorized")
    }
})

router.delete('/', (req, res, next) => {
    if (req.user) {
        let isAdmin = req.user.isAdmin.some(id => {
            return parseInt(id, 10) === parseInt(req.session.selectedProject, 10)
        })
        if (isAdmin) {
            let sql1 = 'DELETE FROM admin_project WHERE project_id = ?'
            let sql2 = 'DELETE FROM deletedWork WHERE project = ?'
            let sql3 = 'DELETE FROM user_project WHERE project_id = ?'
            let sql4 = 'DELETE FROM work WHERE project = ?'
            let sql5 = 'DELETE FROM workTimers WHERE project_id = ?'
            let sql6 = 'DELETE FROM projects WHERE id = ?'
            let data = [req.session.selectedProject]

            db.query(sql1, data, (err, rows, fields) => {
                if (!err)
                    db.query(sql2, data, (err, rows, fields) => {
                        if (!err)
                            db.query(sql3, data, (err, rows, fields) => {
                                if (!err)
                                    db.query(sql4, data, (err, rows, fields) => {
                                        if (!err)
                                            db.query(sql5, data, (err, rows, fields) => {
                                                if (!err)
                                                    db.query(sql6, data, (err, rows, fields) => {
                                                        if (!err)
                                                            res.send("Project deleted")
                                                        else
                                                            console.log(err)
                                                    })
                                                else
                                                    console.log(err)
                                            })
                                        else
                                            console.log(err)
                                    })
                                else
                                    console.log(err)
                            })
                        else
                            console.log(err)
                    })
                else
                    console.log(err)
            })
        } else {
            res.send("unauthorized")
        }
    } else {
        res.send("unauthorized")
    }
})

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
                            db.query('SELECT work.id, users.name, work.workDate, work.workFrom, work.workTo, work.comment FROM work INNER JOIN users ON users.id = work.user WHERE work.project = ? ORDER BY work.workDate DESC', data3, function (err, rows, fields) {
                                if (!err) {
                                    req.session.selectedProject = req.params.id
                                    res.json({ name: project.name, overview: rows })
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