'use strict';

var TimeSlot = require('../models/TimeSlot.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Async = require('async'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util'),
    XDate = require('xdate');

/**
 * TimeSlotService constructor
 *
 * @constructor
 */
var TimeSlotService = function (timeSlotRepository) {

    this.timeSlotRepository = timeSlotRepository;
    Injct.apply(this);
};
module.exports = TimeSlotService;


/**
 * Get available timeSlots for a provider on a given date
 *
 * @param {string} accountId
 * @param {string} providerId
 * @param {number} from
 * @param {number} to
 * @param callback
 */
TimeSlotService.prototype.getAvailableTimeSlotsForProviderByDate = function (accountId, providerId, from, to, callback) {

    var self = this;
    var scheduleService = Injct.getInstance('scheduleService');


    Async.waterfall([getScheduleHours, getAvailableTimeSlots], buildTimeSlots);

    function getScheduleHours(cb) {

        scheduleService.getScheduleByAccountId(accountId, function(err, result) {

            if (err) {
                cb(err);
                return;
            }

            var day = new XDate(from, true).getDay();

            var provider_schedule = result[getDayName(day)].providers[providerId];

            cb(null, provider_schedule);

        });

    }

    function getAvailableTimeSlots(provider_schedule, cb) {

        var timeSlots = [];

        if (provider_schedule.available === false) {
            cb(null, timeSlots);
            return;
        }

        self.timeSlotRepository.getAvailableTimeSlotsForProviderByDate(providerId, from, to, function(err, result) {

            if (err) {
                cb(err);
                return;
            }

            cb(null, result);
        });

    }

    function buildTimeSlots() {

        var timeslots = [];

        var start_timestamp = new XDate(from, true).getTime();
        var end_timestamp = new XDate(to, true).getTime();

        while(start_timestamp <= end_timestamp) {

        }

        callback(null, timeslots);
    }

    function getDayName(dayNum) {
        switch (dayNum) {
            case 0:
                return 'sunday';
            case 1:
                return 'monday';
            case 2:
                return 'tuesday';
            case 3:
                return 'wednesday';
            case 4:
                return 'thursday';
            case 5:
                return 'friday';
            case 6:
                return 'saturday';
        }
    }


};

/**
 * Update a timeSlot
 *
 * @param {TimeSlot} timeSlot
 * @param {Function} callback
 */
TimeSlotService.prototype.updateTimeSlot = function(timeSlot, callback) {
    this.timeSlotRepository.saveTimeSlot(timeSlot, callback);
};

/**
 * Get available time slots
 *
 * @param {TimeSlot} timeslot
 * @param {Function} callback
 */
TimeSlotService.prototype.getAvailableTimeSlots = function(startdate, enddate, minutes, callback) {

    var timeslots = [];

    var start_timestamp = new XDate(startdate, true).getTime();
    var end_timestamp = new XDate(enddate, true).getTime();

    while(start_timestamp <= end_timestamp) {

    }


    callback(null, timeslots);

};

