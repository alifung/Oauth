var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('../models/user');
var facebook = require('passport-facebook').Strategy;
require('dotenv').config();


module.exports = function(app, options) {
    return {
        //middleware
        init: function() {
            passport.use(new facebook({
                    clientID: process.env.appID,
                    clientSecret: process.env.appSecret,
                    callbackURL: 'http://localhost:8081/login/facebook/callback',
                    profileFields: ['id', 'displayName']
                },
                function(access_token, refresh_token, profile, cb) {
                	process.nextTick(function() {
                		User.findOne({'facebook.id': profile.id}, function(err, user) {
                			if (err) {
                				return done(err);
                			}
                			if (user) {
                				return done(null, user);
                			} else {
                				//goes into the database
                				var newUser = new User();
                					newUser.facebook.id = profile.id;
                					newUser.facebook.access_token = access_token;
                					newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                					newUser.save(function(err) {
                						if (err)
                							throw err;
                						return done(null, newUser);
                					})
                				//}	
                			}
                		});
                	});
                });		     		
            });

            //instead, we do query/findOne section here!
            passport.serializeUser(function(user, done) {
            	done(null, user._id);
            });
            passport.deserializeUser(function(id, done) {
            //	User.findById(id, function(err, user) {
            //		if (err || !user) return done(err, null);
            		done(null, user);
            	// });
            });

            app.use(passport.initialize());
            app.use(passport.session());

            app.use(function(req, res, next) {
                //add user to res.locals
                res.locals.user = req.user;
                next();
            });
        },
        //routes
        registerRoutes: function() {
        	//route for fb authentication:
        	app.get('/login/facebook', passport.authenticate('facebook'));
        	//handle the callback
        	app.get('/login/facebook/callback', passport.authenticate('facebook', {
        		successRedirect : '/view',
        		failureRedirect : '/login'
        	}));
        }
    }
};    
//};       
        	//);

            // 	app.get('/signup', function(req, res) {
            // 		res.render('signup', {header: 'Sign Up'});
            // 	});

            // 	app.post('/signup', function(req, res, next) {
            // 		var newUser = new User ({
            // 			username: req.body.username
            // 		});
            // 		User.register(newUser, req.body.password, function(err, user) {
            // 			if (err) {
            // 				console.log('signup error' + err);
            // 				return res.render('signup', {
            // 					flash: {
            // 						type: 'negative',
            // 						header: 'Signup Error',
            // 						body: err.message
            // 					},
            // 					header: 'Sign Up'

            // 				});
            // 			}
            // passport.authenticate('local')(req, res, function() {
            // 	req.session.flash = {
            // 		type: 'positive',
            // 		header: 'Registration Success',
            // 		body: 'Welcome, ' + user.username
            // 	};
            // 	res.redirect('/');
            // });

            // });
            // });

            //flashback as custom callback
    //         app.get('/login', function(req, res) {
    //             res.render('signup', { header: 'Log In' });
    //         });

    //         app.post('/login', passport.authenticate('local'), function(req, res) {
    //             console.log(req.user);
    //             req.session.flash = {
    //                 type: 'positive',
    //                 header: 'Signed in',
    //                 body: "Logged in"

    //             };
    //             res.redirect('/');
    //         });

    //         app.get('/logout', function(req, res) {
    //             req.logout();
    //             req.session.flash = {
    //                 type: 'positive',
    //                 header: 'Signed out',
    //                 body: 'Successfully signed out'
    //             };
    //             res.redirect('/');
    //         });

    //     }
    // }
//};
