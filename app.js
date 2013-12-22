
/**
 * Module dependencies.
 */

var express = require('express'),
routes = require('./routes'),
user = require('./routes/user'),
projects = require('./routes/projects'),
http = require('http'),
path = require('path'),
hogan = require('hogan-express');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', hogan);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(app.router);
  //app.use(express.static(path.join(__dirname, 'public')));
  app.use('/public', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);



app.get('/projects', function (req, res) {
  var projs = require('./models/projects');
  res.send( projs );
});

app.get('/skills', function (req, res) {
  var skills = require('./models/skills');
  res.send( skills );
});

app.get('/contact', function (req, res) {
  var skills = require('./models/contact');
  res.send( skills );
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
