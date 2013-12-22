/*
 * GET home page.
 */

exports.index = function(req, res){
	res.locals = require('../models/navigations');
	res.render('index', { partials : { head : 'head', footer : 'footer', nav : 'nav'} } );
};