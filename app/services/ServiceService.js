'use strict';

var Service = require('../models/Service.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * ServiceService constructor
 *
 * @constructor
 */
var ServiceService = function (serviceRepository) {

    this.serviceRepository = serviceRepository;
    Injct.apply(this);
};
module.exports = ServiceService;


/**
 * Gets the schedule from mongo
 *
 * @param id string
 * @param callback
 */
ServiceService.prototype.getServiceById = function (_id, callback) {
    this.serviceRepository.getServiceById(_id, callback);
};


/**
 * Update a service
 *
 * @param {Service} service
 * @param {Function} callback
 */
ScheduleService.prototype.updateService = function(schedule, callback) {
    this.serviceRepository.saveService(service, callback);
};
