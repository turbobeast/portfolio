exports.projects = function (req, res) {
	var projs = require('../models/projects');
	res.send( projs );
};