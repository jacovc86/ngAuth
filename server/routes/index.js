var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  	res.render('index', {
		active: req.isAuthenticated(),
		user: req.user
	});
});
router.get('/auth_partials/:any', function(req,res,next) {
	res.render('auth_partials/'+req.params.any);
});
router.get('/store_partials/:any', function(req,res,next) {
	res.render('store_partials/'+req.params.any);
});
router.get('/dashboard', function(req,res,next) {
	console.log(req.isAuthenticated());
	res.render('dashboard');
});
router.get('/profile', function(req,res,next) {
	res.render('profile');
});
router.get('/dashboard/:any', function(req,res,next) {
	res.render('dashboard_partials/'+req.params.any);
});
module.exports = router;