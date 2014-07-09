'use strict';

var Schedule = require('../models/Schedule.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var ScheduleRepository = function () {};
module.exports = ScheduleRepository;


/**
 * Finds a schedule by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ScheduleRepository.prototype.getScheduleById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Schedule.model().findById(id, fields, function (err, schedule) {

        if (err) {
            Logger.error("Error trying to find schedule by id %j", id, err);
            return callback(err);
        }

        if (!schedule) {
            Logger.error("Schedule not found", id);
            return callback(new Error('Schedule not found'));
        }

        callback(null, new Schedule(schedule.toObject()));

    });
};

/**
 * Get schedule by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ScheduleRepository.prototype.getScheduleByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Schedule.model().findOne({account_id: account_id}, fields, function (err, schedule) {

        if (err) {
            Logger.error("Error trying to find schedule by account_id %j", account_id, err);
            return callback(err);
        }

        callback(null, schedule);

    });
};

/**
 * Save a schedule
 *
 * @param {Schedule} schedule
 * @param {Function(err, schedule)} callback
 */
ScheduleRepository.prototype.saveSchedule = function (schedule, callback) {

    Schedule.model().findOneAndUpdate({ account_id: schedule.account_id}, schedule, {upsert: true, new: true}, function (err, result) {
        callback(err, result);
    });

};


