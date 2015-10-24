var config = require('../config');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/'+config.database.name);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	console.log('connection open to: '+config.database.name);
});

var Account = new Schema({
	username: String,
	name: {
		first: String,
		last: String
	},
	password: String,
	email: String,
	facebook_id: String,
	google_id: String,
	twitter_id: String,
	picture: String
});
Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account',Account);