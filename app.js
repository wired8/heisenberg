/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var csrf = require('lusca').csrf();
var methodOverride = require('method-override');
var Path = require('path');
var Logger = require('./app/util/Logger');

var _ = require('lodash');
var MongoStore = require('connect-mongo')({ session: session });
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var secrets = require('./config/secrets');

var ControllerManager = require('./app/controllers/common/ControllerManager.js').ControllerManager;
var ControllerPath = Path.resolve(Path.join(Path.resolve('.'),'app','controllers'));

var InitializerManager = require('./config/initializers/InitializerManager.js').InitializerManager;
var InitializerPath = Path.resolve(Path.join(Path.resolve('.'),'config','initializers'));
var initializerManager = new InitializerManager(InitializerPath);

Heisenberg = express();

initializerManager.loadApplicationInitializers(function() {

    initializeExpress();
    this.initialized = true;

    var controllerManager = new ControllerManager(ControllerPath);
    controllerManager.loadControllers();

    listen();
});

function initializeExpress() {

    mongoose.connect(secrets.db);
    mongoose.connection.on('error', function() {
        Logger.error('MongoDB Connection Error. Make sure MongoDB is running.');
    });

    var hour = 3600000;
    var day = hour * 24;
    var week = day * 7;

    /**
     * CSRF whitelist.
     */

    var csrfExclude = ['/url1', '/url2'];

    /**
     * Express configuration.
     */

    Heisenberg.set('port', process.env.PORT || 3000);
    Heisenberg.set('views', path.join(__dirname, 'views'));
    Heisenberg.set('view engine', 'jade');
    Heisenberg.use(compress());
    Heisenberg.use(connectAssets({
        paths: ['public/css', 'public/js'],
        helperContext: Heisenberg.locals
    }));
    Heisenberg.use(logger('dev'));
    Heisenberg.use(bodyParser.json());
    Heisenberg.use(bodyParser.urlencoded());
    Heisenberg.use(expressValidator());
    Heisenberg.use(methodOverride());
    Heisenberg.use(cookieParser());
    Heisenberg.use(session({
        secret: secrets.sessionSecret,
        store: new MongoStore({
            url: secrets.db,
            auto_reconnect: true
        })
    }));
    Heisenberg.use(passport.initialize());
    Heisenberg.use(passport.session());
    Heisenberg.use(flash());
    Heisenberg.use(function(req, res, next) {
        // CSRF protection.
        if (_.contains(csrfExclude, req.path)) return next();
        csrf(req, res, next);
    });
    Heisenberg.use(function(req, res, next) {
        // Make user object available in templates.
        res.locals.user = req.user;
        next();
    });
    Heisenberg.use(function(req, res, next) {
        // Remember original destination before login.
        var path = req.path.split('/')[1];
        if (/auth|login|logout|signup|img|fonts|favicon/i.test(path)) {
            return next();
        }
        req.session.returnTo = req.path;
        next();
    });
    Heisenberg.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));

    /**
     * 500 Error Handler.
     */

    Heisenberg.use(errorHandler());
};

/**
 * Start Express server.
 */
function listen() {
    Heisenberg.listen(Heisenberg.get('port'), function() {
        Logger.info('Heisenberg server listening on port %d in %s mode', Heisenberg.get('port'), Heisenberg.get('env'));
    });
};

module.exports = Heisenberg;




/**
 * API examples routes.
 */

/*
 Heisenberg.get('/api', apiController.getApi);
 Heisenberg.get('/api/lastfm', apiController.getLastfm);
 Heisenberg.get('/api/nyt', apiController.getNewYorkTimes);
 Heisenberg.get('/api/aviary', apiController.getAviary);
 Heisenberg.get('/api/steam', apiController.getSteam);
 Heisenberg.get('/api/stripe', apiController.getStripe);
 Heisenberg.post('/api/stripe', apiController.postStripe);
 Heisenberg.get('/api/scraping', apiController.getScraping);
 Heisenberg.get('/api/twilio', apiController.getTwilio);
 Heisenberg.post('/api/twilio', apiController.postTwilio);
 Heisenberg.get('/api/clockwork', apiController.getClockwork);
 Heisenberg.post('/api/clockwork', apiController.postClockwork);
 Heisenberg.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
 Heisenberg.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
 Heisenberg.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
 Heisenberg.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
 Heisenberg.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
 Heisenberg.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);
 Heisenberg.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
 Heisenberg.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
 Heisenberg.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);
 Heisenberg.get('/api/instagram', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getInstagram);
 Heisenberg.get('/api/yahoo', apiController.getYahoo);



 Heisenberg.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
 Heisenberg.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
 res.redirect(req.session.returnTo || '/');
 });

 Heisenberg.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
 Heisenberg.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
 res.redirect(req.session.returnTo || '/');
 });
 Heisenberg.get('/auth/twitter', passport.authenticate('twitter'));
 Heisenberg.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
 res.redirect(req.session.returnTo || '/');
 });
 */

