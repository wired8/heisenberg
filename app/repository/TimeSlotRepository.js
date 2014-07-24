'use strict';

var TimeSlot = require('../models/TimeSlot.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var TimeSlotRepository = function () {};
module.exports = TimeSlotRepository;


/**
 * Finds a timeslot by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
TimeSlotRepository.prototype.getTimeSlotById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    TimeSlot.model().findById(id, fields, function (err, timeslot) {

        if (err) {
            Logger.error("Error trying to find timeslot by id %j", id, err);
            return callback(err);
        }

        if (!timeslot) {
            Logger.error("TimeSlot not found", id);
            return callback(new Error('TimeSlot not found'));
        }

        callback(null, new TimeSlot(timeslot.toObject()));

    });
};

/**
 * Get timeslot by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
TimeSlotRepository.prototype.getTimeSlotByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    TimeSlot.model().findOne({account_id: account_id}, fields, function (err, timeslot) {

        if (err) {
            Logger.error("Error trying to find timeslot by account_id %j", account_id, err);
            return callback(err);
        }

        callback(null, timeslot);

    });
};

/**
 * Save a timeslot
 *
 * @param {TimeSlot} timeslot
 * @param {Function(err, timeslot)} callback
 */
TimeSlotRepository.prototype.saveTimeSlot = function (timeslot, callback) {

    TimeSlot.model().findOneAndUpdate({ account_id: timeslot.account_id}, timeslot, {upsert: true, new: true}, function (err, result) {
        callback(err, result);
    });

};


