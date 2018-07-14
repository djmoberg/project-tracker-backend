var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MemcachedStore = require('connect-memcached')(session);
var bodyParser = require('body-parser');
var cors = require('cors')
var auth = require('./auth')

require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authenticateRouter = require('./routes/authenticate')
var userRouter = require('./routes/user')
var projectsRouter = require('./routes/projects')
var projectRouter = require('./routes/project')
var workRouter = require('./routes/work')
var workTimerRouter = require('./routes/workTimer')

var app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true
}))
// app.use(cookieParser());
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
	store: new MemcachedStore({
        hosts: [process.env.MEMCACHE_URL || '127.0.0.1:11211']
})
}))

app.use(auth.initialize());
app.use(auth.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/authenticate', authenticateRouter)
app.use('/user', userRouter)
app.use('/projects', projectsRouter)
app.use('/project', projectRouter)
app.use('/work', workRouter)
app.use('/workTimer', workTimerRouter)

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
