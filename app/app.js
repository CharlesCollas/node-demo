// App entry point
// ===============

'use strict';

// Requiring this module runs the app.  It is, for instance, required
// by the CLI interface (`.bin/blend-demo`) when it is done setting up.

var express = require('express');
    require('express-namespace');
var flash = require('connect-flash');
var http = require('http');
var path = require('path');
var passport = require('passport');

// Create the core web app container (`app`), bind and HTTP server to it
// (`server`) and determine the full path for public assets.
var app = express();
var server = http.createServer(app);
var publicPath = path.join(__dirname, '..', 'public');

// Configuration
// -------------

// Configuration and middleware for all environments (dev, prod, etc.)
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.logger(app.get('env') === 'development' ? 'dev' : 'default'));
// FIXME: https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('I can haz JS Quiz!'));
app.use(express.cookieSession());
// This is not Adobe's Flash!  This is session flashes--messages that are
// only retained until the next view rendered for the session.
app.use(flash());
// Passport initialization (authentication middleware and schemes)
app.use(passport.initialize());
app.use(passport.session());
// Static file serving
app.use(express.static(publicPath));

// Make the session flash and params readable by all views
app.use(function(req, res, next) {
  app.locals.flash = req.flash();
  app.locals.query = req.query;
  next();
});

// Shared locals for all views
app.locals.title = "Node Demo @ tech·days 2014";
app.locals.marked = require('marked');

// Development-only configuration (full error logging)
app.configure('development', function() {
  app.use(express.errorHandler());
});

// Main app "submodules"
// ---------------------

// Because Express will automatically insert the Router middleware as soon as
// we define a route, we need to run our subapp setups in two blocks:
// middlewares first, then routes.
require('./back')(app, 'middleware');
require('./front')(app, 'middleware', server);
require('./back')(app, 'routes');
require('./front')(app, 'routes');

// If you have a proper Arduino board connected (check the annotated
// source of the `arduino.js` module), uncomment that line to start
// the module.
// require('./arduino');

// This actually launches the server by listening on the relevant port for
// incoming HTTP connections.  The default port is 3000.
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
