'use strict';

var injct = require('injct'),
    util = require('util'),
    config = require('config'),
    redis = require('redis'),
//    DatabaseSetup = require('./DatabaseSetup.js'),
    Constants = require('../../app/util/Constants.js');

/**
 * Init all dependency injection references
 */
exports.init = function (cb) {

    setupDependencies(function() {

       // injct.getInstance('redisExpireNotificationService')
       //     .monitorExpiredKeys();

       // new DatabaseSetup(cb);
        cb();
    });

};

/**
 * Setup dependencies
 *
 * @param cb
 */
function setupDependencies(cb) {

    injct.unique({
        userRepository: reqRepository('UserRepository'),
        userService: reqService('UserService'),
        adminRepository: reqRepository('AdminRepository'),
        adminService: reqService('AdminService'),
        adminRoleRepository: reqRepository('AdminRoleRepository')
    });

    if (cb) {
        cb();
    }
}
exports.setupDependencies = setupDependencies;


/**
 * Helper to require a service
 *
 * @param service
 * @returns {*}
 */
function reqService(service) {
    return req(util.format('/services/%s.js', service));
}

/**
 * Helper to require a repository
 *
 * @param repository
 * @returns {*}
 */
function reqRepository(repository) {
    return req(util.format('/repository/%s.js', repository));
}

/**
 * Helper to require relative to app
 *
 * @param pkg
 * @returns {*}
 */
function req(pkg) {
    return require('../../app' + pkg);
}