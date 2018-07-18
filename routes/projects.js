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

router.get('/find/:input', function (req, res, next) {
	if (req.user) {
		let data = [req.params.input]
		db.query("SELECT id, name, description FROM projects WHERE name LIKE ?", req.params.input + '%', (err, rows, fields) => {
			if (!err)
				res.json(rows)
			else
				console.log(err)
		})
	} else {
		res.send("unauthorized")
	}
});

router.post('/joinRequest', function (req, res, next) {
	if (req.user) {
		let data = [[req.user._id, req.body.projectId]]
		db.query("INSERT INTO request_project (user_id, project_id) VALUES (?)", data, (err, rows, fields) => {
			if (!err)
				res.send("Request sent")
			else
				console.log(err)
		})
	} else {
		res.send("unauthorized")
	}
});

module.exports = router;