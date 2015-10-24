var config = require('../config'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/'+config.database.name);
var Store = new Schema({
	name: String,
	category: {
		id: String,
		name: String
	},
	owner: String
});
module.exports = mongoose.model('Store',Store);