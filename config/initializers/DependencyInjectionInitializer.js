'use strict';

var injct = require('injct'),
    util = require('util'),
    config = require('config'),
    redis = require('redis'),
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
        accountService: reqService('AccountService'),
        accountRepository: reqRepository('AccountRepository'),
        bookingService: reqService('BookingService'),
        bookingRepository: reqRepository('BookingRepository'),
        formService: reqService('FormService'),
        formRepository: reqRepository('FormRepository'),
        providerService: reqService('ProviderService'),
        providerRepository: reqRepository('ProviderRepository'),
        serviceRepository: reqRepository('ServiceRepository'),
        serviceService: reqService('ServiceService'),
        scheduleRepository: reqRepository('ScheduleRepository'),
        scheduleService: reqService('ScheduleService'),
        timeSlotRepository: reqRepository('TimeSlotRepository'),
        timeSlotService: reqService('TimeSlotService'),
        userRepository: reqRepository('UserRepository'),
        userService: reqService('UserService')
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