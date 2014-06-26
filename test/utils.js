var config = require('config');
var mongoose = require('mongoose');
var mongodbConf = config.get('mongodb');
var User = req('/models/User.js');
var Item = req('/models/Item.js');
var Gift = req('/models/Gift.js');
var Narrative = req('/models/Narrative.js');
var UserCharacter = req('/models/UserCharacter.js');
var ServerBase = require('ServerBase');
var MetaDataUtil = ServerBase.MetaDataUtil;
var sinon = require('sinon');
var redis = require('redis');
var Memcached = require('memcached');
var PurchasingInitializer = require('../config/initializers/PurchasingInitializer.js');
var MetadataUpdater = require('../app/jobs/MetadataUpdater.js');
var DatabaseSetup = require('../config/initializers/DatabaseSetup.js');

/**
 * Setup for integration tests
 * @param done
 */
exports.setup = function (done) {

    mongoose.connect('mongodb://' + mongodbConf.dbHost + '/' + mongodbConf.dbTest);
    console.log('mongodb://' + mongodbConf.dbHost + '/' + mongodbConf.dbTest);

    initDependencies();

    setTimeout(done, 200);
};

/**
 * Setup for unit testing
 */
exports.setupUnit = function (done) {

    initUnitDependencies(done);
    setupFakeMetadata();

}

/**
 * Tear down for integration tests
 * @param done
 */
exports.tearDown = function (done) {

    User.model().remove({}, logDrop);
    User.model().collection.dropAllIndexes(logDrop);

//    Gift.model().remove({}, logDrop);
    UserCharacter.model().remove({}, logDrop);

    Item.model().remove({}, logDrop);
    Narrative.model().remove({}, logDrop);

    mongoose.connection.close();

    exports.flushRedis();

    if (done) {
        done();
    }
};

exports.flushRedis = function() {
    /* flush redis */
    var redis_config = config.get('redis');
    var redis_client = redis.createClient(redis_config.port, redis_config.host);

    redis_client.send_command('FLUSHALL', []);
}

function logDrop(err) {
    if (err) {
        console.log('ERROR dropping user collection: ' + err);
        return;
    }
    console.log('collection removed');

}


/* SETUP DEPENDENCY INJECTION FOR TESTS WITH FAKE MOBAGE AND MEMCACHE */

var injct = require('injct')
    , util = require('util');

/**
 * Init all dependency injection references
 */
function initDependencies(cb) {

    MetaDataUtil.setFilesPath(__dirname + "/../app/models/generated/");

    global.ngServer = {};
    global.ngServer.Cache = new Memcached('localhost:11211');

    setupFakeAnalyticsAndLogger();

    ServerBase.init(injct, {
        redis: config.get('redis'),
        pubnub: config.get('pubnub'),
        androidApp: config.get('androidApp'),
        iosApp: config.get('iosApp'),
    }, done);

    function done() {
        require('../config/initializers/DependencyInjectionInitializer.js')
            .setupDependencies(cb);
    }

}

/**
 * Fake analytics
 *
 */
function setupFakeAnalyticsAndLogger() {

    global.Analytics = {
        gameEvent: console.log,
        _buildGameEvent: function() {},
        analyticsClient: {
            makeRequest: function() {}
        }
    };

    global.logger = {
        info: console.log,
        warn: console.log,
        debug: function () {
        },
        error: console.error
    };

}
/**
 * Fake stuff for unit testing
 * @param cb
 */
function initUnitDependencies(cb) {

    setupFakeAnalyticsAndLogger();

    MetaDataUtil.setFilesPath(__dirname + "/../app/models/generated/");

    if (cb) {
        cb();
    }

}



function req(pkg) {

    if (process.env.ZOO_COV) {
        return require('../app-cov' + pkg);
    } else {
        return require('../app' + pkg);
    }
}
exports.require = req;

function reqService(service) {
    return req(util.format('/services/%s.js', service));
}

function reqRepository(repository) {
    return req(util.format('/repository/%s.js', repository));
}
