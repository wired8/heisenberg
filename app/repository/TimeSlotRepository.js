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
            callback(err);
            return;
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

    timeslot.model().save(function (err, _timeslot) {
        if (err) {
            Logger.error("Error trying to save timeslot  %j", timeslot, err);
            callback(err);
            return;
        }

        callback(null, new TimeSlot(_timeslot));
    });
};

/**
 * Delete a time slot by provider and start date
 *
 * @param {string} provider
 * @param {number} start_date
 * @param {Function} callback
 */
TimeSlotRepository.prototype.deleteTimeSlotByProviderStartDate = function(provider_id, start_date, callback) {
    TimeSlot.model().remove({ provider_id: provider_id, start: start_date }, callback)
};



