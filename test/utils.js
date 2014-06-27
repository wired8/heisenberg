var config = require('config');
var mongoose = require('mongoose');
var mongodbConf = config.get('mongodb');
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

};

/**
 * Tear down for integration tests
 * @param done
 */
exports.tearDown = function (done) {

    User.model().remove({}, logDrop);
    User.model().collection.dropAllIndexes(logDrop);

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
};

function logDrop(err) {
    if (err) {
        console.log('ERROR dropping user collection: ' + err);
        return;
    }
    console.log('collection removed');
}

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
