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
 * Get timeslots by provider_id between from and to
 *
 * @param {String|HexId} provider_id
 * @param [Int] from
 * @param [Int] To
 *
 * @param {Function} callback
 */
TimeSlotRepository.prototype.getTimeSlotsByProviderId = function (provider_id, from, to, callback) {

    TimeSlot.model().find({start: { $gte: from }, end: { $lte: to }, provider_id: provider_id}, {},  function (err, timeslots) {

        if (err) {
            Logger.error("Error trying to find timeslots by provider_id %j", provider_id, err);
            return callback(err);
        }

        callback(null, timeslots);

    });
};

/**
 * Save a timeslot
 *
 * @param {TimeSlot} timeslot
 * @param {Function(err, timeslot)} callback
 */
TimeSlotRepository.prototype.saveTimeSlot = function (timeslot, callback) {

    TimeSlot.model().findOneAndUpdate({}, timeslot, {upsert: true, new: true}, function (err, result) {
        callback(err, result);
    });

};


