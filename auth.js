var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var bcrypt = require('bcrypt')

// Register a login strategy
passport.use('login', new LocalStrategy(
    function (username, password, done) {
        var db = require('./db')
        db.query('SELECT * FROM users WHERE name = (?)', username, function (err, rows, fields) {
            if (!err) {
                if (rows.length !== 0) {
                    bcrypt.compare(password, rows[0].password, function (err, res2) {
                        if (res2) {
                            let data = [rows[0].id]
                            db.query('SELECT * FROM admin_project WHERE user_id = ?', data, function (err, rows2, fields) {
                                if (!err) {
                                    if (rows2.length !== 0) {
                                        let isAdmin = rows2.map((row) => {
                                            return row.project_id
                                        })
                                        return done(null, { _id: rows[0].id, username, password, isAdmin });
                                    } else {
                                        return done(null, { _id: rows[0].id, username, password, isAdmin: [] });
                                    }
                                } else
                                    console.log(err);
                            });
                        } else {
                            done(null, false, { message: 'Invalid username and password.' });
                        }
                    });
                } else {
                    done(null, false, { message: 'Invalid username and password.' });
                }
            }
            else
                console.log(err);
        });
    }
));

// Required for storing user info into session 
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// Required for retrieving user from session
passport.deserializeUser(function (id, done) {
    // The user should be queried against db using the id
    var db = require('./db')
    db.query('SELECT * FROM users WHERE id = (?)', id, function (err, rows, fields) {
        if (!err) {
            if (rows.length !== 0) {
                let data = [id]
                db.query('SELECT * FROM admin_project WHERE user_id = ?', data, function (err, rows2, fields) {
                    if (!err) {
                        if (rows2.length !== 0) {
                            let isAdmin = rows2.map((row) => {
                                return row.project_id
                            })
                            done(null, { _id: id, username: rows[0].name, password: rows[0].password, isAdmin });
                        } else {
                            done(null, { _id: id, username: rows[0].name, password: rows[0].password, isAdmin: [] });
                        }
                    } else
                        console.log(err);
                });
            } else {
                console.log("No user");
            }
        }
        else
            console.log(err);
    });
});

module.exports = passport;