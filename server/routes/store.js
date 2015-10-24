var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Store = require('../models/store'),
	config = require('../config');

router.post('/new', function(req, res, next) {
	Store.create(req.body, function(err, store) {
		console.log('store: ',store);
		if(err) res.send({err: err});
		else res.send(store);
	});
});

router.get('/all/:id', function(req, res, next) {
	console.log(req);
	console.log('req: '+req.params.id);
	/*Store.find({owner: req.body.user.id}).exec(function(err, stores) {
		if(err) res.send(err);
		else res.send(stores);
	});*/
});

module.exports = router;