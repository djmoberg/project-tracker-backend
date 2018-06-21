var express = require('express');
var router = express.Router();

var db = require('../db');

/* GET users listing. */
router.get('/find/:input', function (req, res, next) {
	if (req.user) {
		let data = [req.params.input]
		db.query("SELECT name FROM users WHERE name LIKE ?", req.params.input + '%', (err, rows, fields) => {
			if (!err)
				res.json(rows)
			else
				console.log(err)
		})
	} else {
		res.send("unauthorized")
	}
});

module.exports = router;
