var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var compression = require('compression');
var helmet = require('helmet');

var app = express();

app.use(helmet());

// Set up mongoos connection
const mongoose = require('mongoose');
var dev_db_url =
	'mongodb+srv://saltest1:1234567890@cluster0.jaerj.mongodb.net/local_library?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;
// Binds to the error event (so that errors will be printed to the console)
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
	sassMiddleware({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
		indentedSyntax: true, // true = .sass and false = .scss
		sourceMap: true
	})
);
app.use(compression()); //Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

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
