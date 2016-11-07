// load modules
var express = require('express');
var hbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //needs to know about the session
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// load .env
require('dotenv').config();

// create app
var app = express();

var PORT = process.env.PORT || 8081;

//pass a secret
//app.use(cookieParser(process.env.cookieSecret));

// init handlebars
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//setup cookie parser and body parser middleware before routes that need them

// app.use(cookieParser({
// 	secret: process.env.cookieSecret
// }));

//gets value of form fields from req.body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

mongoose.connect(process.env.DB_URL);

var options = {};


app.use(session({
	secret: process.env.cookieSecret,
	cookie: {
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7 //one day
	},
	resave: false, //keep only if you want to keep last visit
	saveUninitialize: true, //for every site visitor
	store: new MongoStore({
		url: process.env.DB_URL
	})
}));


//attach req.session.flash to res.locals (local variable)
app.use(function(req, res, next) {
	res.locals.flash = req.session.flash; //transfer to the local variable to render on page
	delete req.session.flash;
	next();
});

//req as a function and pass app as a parameter
var auth = require('.//lib/auth')(app, options);
auth.init(); //setup middleware related to authentication
auth.registerRoutes();

//home page
app.get('/', function(req, res) {
	if (req.session.treat) {
		// if (req.cookies.treat) {
		return res.render('view', {
			//msg: 'You have a treat: ' + req.signedCookies.treat
			msg: 'You have a treat: ' + req.session.treat
		});
	}
  return res.render('view', {
    msg: 'No treats'
  });
});

app.get('/treat', function(req, res) {
	req.session.treat = 'candy corn';
	req.session.flash = {
		type: 'positive', 
		header: 'You got a treat',
		body: 'The treat is ' + req.session.treat
	};
	// cookie('treat', 'candy corn', {
	// 	httpOnly: true,
	// 	signed: true
	// });
	res.redirect('/');
});

app.get('/clear', function(req, res) {
	// res.clearCookie('treat');
	delete req.session.treat;
	req.session.flash = {
		type: 'negative', 
		header: 'No treat',
		body: 'The bag is empty'
	};
	//delete req.cookies.treat;
	res.redirect('/');
});



// start server
app.listen(PORT, function() {
  console.log('listening on port ', PORT);
});