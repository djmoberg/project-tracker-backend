var express = require('express');
var router = express.Router();

var db = require('../db');

router.get('/', function (req, res, next) {
    let query = 'SELECT projects.id, projects.name FROM user_project INNER JOIN projects ON projects.id = user_project.project_id WHERE user_project.user_id = (?)'
    db.query(query, [req.user._id], function (err, rows, fields) {
        if (!err)
            res.json(rows)
        else
            console.log(err);
    });
});

module.exports = router;