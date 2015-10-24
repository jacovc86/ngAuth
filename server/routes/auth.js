var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	LocalStrategy = require('passport-local');
	mongoose = require('mongoose'),
	Account = require('../models/account'),
	config = require('../config');
passport.use(Account.createStrategy());
passport.serializeUser(function(user, done) {  done(null, user.id);});
passport.deserializeUser(function(id, done) {  Account.findById(id, function(err, user) { done(err, user)}); });
router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if(err) { return next(err); }
		if(!user) { return res.send({message: info.message}); }
		req.login(user, function(err) {
			if(err) { return next(err); }
			return res.send({
				user: {
					id: 		user._id,
					username: 	user.username,
					name: 		user.name,
					email: 		user.email,
					picture: 	user.picture
				}
			});
		});
	})(req, res, next);
});
router.post('/logout', function(req,res,next) {
	req.logout();
	console.log('logout! auth? ' + req.isAuthenticated());
	res.redirect('/');
});
router.post('/facebook_login', function(req, res, next) {
	Account.findOne({email: req.body.email}).exec(function(err, user) {
		if(err) { res.send({err: err}); }
		if(!user) {
			Account.register(new Account({
				username: req.body.email, 
				name: {first: req.body.first_name, last: req.body.last_name},
				email: req.body.email,
				picture: req.body.picture.data.url}),
				req.body.id,
				function(err, user) {
					console.log('callback: ');
					console.log(user);
					if(err) {
						console.log('Error~ '+err);
						res.send({err: err});
					}
					else {
						res.send({
							user: {
								id: 		user._id,
								username: 	user.username,
								name: 		user.name,
								email: 		user.email,
								picture: 	user.picture
							},
							action: 'register'
						});
					}
				}
			);
		}
		else {
			req.logIn(user, function(err) {
				if(err) { return next(err); }
				return res.send({
					user: {
						id: 		user._id,
						username: 	user.username,
						name: 		user.name,
						email: 		user.email,
						picture: 	user.picture
					},
					action: 'login'
				});
			});
		}
	});
});
router.post('/register', function(req, res, next) {
	Account.register(new Account({
		username: req.body.username, 
		name: {first: req.body.fname, last: req.body.lname},
		email: req.body.email,
		picture: req.body.picture}),
		req.body.password,
		function(err, user) {
			if(err) {
				console.log('Error~ '+err);
				res.send({err: err});
			}
			else if(user) {
				passport.authenticate('local')(req, res, function() {
					res.send({
						user: {
							id: 		user._id,
							username: 	user.username,
							name: 		user.name,
							email: 		user.email,
							picture: 	user.picture
						}
					});
				});
			}
		}
	);
});

router.post('/user', function(req,res,next) {
	var q = req.body.q, by = req.body.by === 'id' ? '_id' : req.body.by, query = {};
	query[by] = q;
	Account.findOne(query).exec(function(err, user) {
		if(err) {
			res.send({err: err});
		}
		else {
			if(user) {
				res.send({
					user: {
						id: user._id,
						username: user.username,
						name: user.name,
						email: user.email,
						picture: user.picture
					}
				});
			}
			else {
				res.send({message: 'User Not Found'});
			}
		}
	});
});

module.exports = router;