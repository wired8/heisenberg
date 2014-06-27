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
 * Save a schedule
 *
 * @param {Schedule} schedule
 * @param {Function(err, schedule)} callback
 */
ScheduleRepository.prototype.saveSchedule = function (schedule, callback) {

    if (schedule._id) {

        var id = schedule._id;
        delete schedule._id;
        Schedule.model().findByIdAndUpdate(id, schedule, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        schedule.model().save(function (err, _schedule) {
            if (err) {
                return callback(err);
            }
            callback(null, new Schedule(_schedule));
        });

    }
};


