'use strict';

var Schedule = require('../models/Schedule.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * ScheduleService constructor
 *
 * @constructor
 */
var ScheduleService = function (scheduleRepository) {

    this.scheduleRepository = scheduleRepository;
    Injct.apply(this);
};
module.exports = ScheduleService;


/**
 * Gets the schedule from mongo
 *
 * @param id string
 * @param callback
 */
ScheduleService.prototype.getScheduleById = function (_id, callback) {
    this.scheduleRepository.getScheduleById(_id, callback);
};

/**
 * Gets the schedule by account id
 *
 * @param account_id string
 * @param callback
 */
ScheduleService.prototype.getScheduleByAccountId = function (account_id, callback) {
    this.scheduleRepository.getScheduleByAccountId(account_id, callback);
};


/**
 * Update a schedule
 *
 * @param {Schedule} schedule
 * @param {Function} callback
 */
ScheduleService.prototype.updateSchedule = function(schedule, callback) {
    this.scheduleRepository.saveSchedule(schedule, callback);
};
