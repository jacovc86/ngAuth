var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  	res.render('dashboard', {
		active: req.isAuthenticated(),
		user: req.user
	});
});
router.get('/dashboard_partials/:any', function(req,res,next) {
	res.render('dashboard_partials/'+req.params.any);
});
module.exports = router;