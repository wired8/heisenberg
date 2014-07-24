var injct = require('injct'),
    util = require('util'),
    config = require('../config/config'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    Provider = req('/models/Provider.js'),
    Service = req('/models/Service.js');

/**
 * Setup for integration tests
 * @param done
 */
exports.setup = function (done) {

    exports.flushRedis();

    mongoose.connect(config.mongodbTest.url);
    console.log(config.mongodbTest.url);

    initDependencies();

    setTimeout(done, 200);
};

/**
 * Setup for unit testing
 */
exports.setupUnit = function (done) {

    done();

};

/**
 * Tear down for integration tests
 * @param done
 */
exports.tearDown = function (done) {

    Provider.model().remove({}, logDrop);
    Provider.model().collection.dropAllIndexes(logDrop);
    Service.model().remove({}, logDrop);
    Service.model().collection.dropAllIndexes(logDrop);

    mongoose.connection.close();

    exports.flushRedis();

    if (done) {
        done();
    }
};

exports.flushRedis = function() {
    /* flush redis */
    var redis_client = redis.createClient(config.redis.port, config.redis.host);
    redis_client.send_command('FLUSHALL', []);
};

function logDrop(err) {
    if (err) {
        console.log('ERROR dropping collection: ' + err);
        return;
    }
    console.log('collection removed');
}



/**
 * Init all dependency injection references
 */
function initDependencies(cb) {

    require('../config/initializers/DependencyInjectionInitializer.js')
        .setupDependencies(cb);

}


function req(pkg) {
    return require('../app' + pkg);
}

exports.require = req;

function reqService(service) {
    return req(util.format('/services/%s.js', service));
}

function reqRepository(repository) {
    return req(util.format('/repository/%s.js', repository));
}
