'use strict';

var injct = require('injct'),
    util = require('util'),
    config = require('../config/config'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    Provider = require('../app/models/Provider.js'),
    Service = require('../app/models/Service.js'),
    Account = require('../app/models/Account.js');

/**
 * Setup for integration tests
 * @param done
 */
exports.setup = function (done) {

   // exports.flushRedis();

    mongooseConnect(function() {
        initDependencies(function() { setTimeout(done, 200) });
    });
};

var mongooseConnect = function(next) {
    var db = mongoose.connection;

    db.on('connecting', function () {
        console.warn('Mongoose is connecting');
    });

    db.on('connected', function () {
        console.warn('Mongoose connected');
        next();
    });



    mongoose.connect(config.mongodbTest.url);
    console.log(config.mongodbTest.url);
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

    mongoose.connection.db.dropDatabase(function() {
        mongoose.connection.removeAllListeners('connecting');
        mongoose.connection.removeAllListeners('connected');
        mongoose.connection.close(done);
    });

   // exports.flushRedis();
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
