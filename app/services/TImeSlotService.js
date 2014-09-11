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
 * @param {string} serviceId
 * @param {number} from
 * @param {number} to
 * @param callback
 */
TimeSlotService.prototype.getAvailableTimeSlotsForProviderByDate = function (accountId, providerId, serviceId, date, callback) {

    var self = this;
    var scheduleService = Injct.getInstance('scheduleService');

    Async.waterfall([getAccountScheduleHours, getProviderBreaks, getServicePeriod,  getProviderAvailableTimeSlots], callback);

    function getAccountScheduleHours(cb) {

        scheduleService.getScheduleByAccountId(accountId, function(err, weekly_schedule) {

            if (err) {
                cb(err);
                return;
            }

            var day = new XDate(date, true).getDay();

            var provider_ids = weekly_schedule[getDayName(day)].providers;

            var valid_provider = _.find(provider_ids, function(provider_id) {
                return providerId === provider_id;
            });

            var schedule = weekly_schedule[getDayName(day)];

            if (!valid_provider) {
                callback('Invalid provider');
            }

            cb(null, schedule);

        });
    }

    function getProviderBreaks(schedule, cb) {

        var providerService = Injct.getInstance('providerService');

        providerService.getProviderById(providerId, function(err, provider) {

            var day = new XDate(date, true).getDay();
            var breaks = provider.breaks[getDayName(day)];

            cb(null, schedule, breaks);

        });
    }

    function getServicePeriod(schedule, provider_breaks, cb) {

        var serviceService = Injct.getInstance('serviceService');

        serviceService.getServiceById(serviceId, function(err, service) {

            if (err) {
                Logger.error('Invalid service id %j: %j', serviceId, err);
                callback('Invalid service id');
                return;
            }

            if (!service) {
                callback('Service empty!');
                return;
            }

            var service_duration = {
                padding_before_minutes: (service.padding_before.hours * 60) + service.padding_before.minutes,
                duration_minutes: (service.duration.hours * 60) + service.duration.minutes,
                padding_after_minutes: (service.padding_after.hours * 60) + service.padding_after.minutes
             };

            cb(null, schedule, provider_breaks, service_duration);

        });

    }

    function getProviderAvailableTimeSlots(schedule, provider_breaks, service_duration, cb) {

        var day = new XDate(date).getDate();
        var month = new XDate(date).getMonth();
        var year = new XDate(date).getFullYear();

        var from = new XDate(year, month, day, 0, 0, 0, 0).getTime();
        var to = new XDate(year, month, day, 23, 59, 59, 59).getTime();

        self.timeSlotRepository.getTimeSlotsByProviderId(providerId, from, to, function(err, timeslots) {

            if (err) {
                cb(err);
                return;
            }

            cb(null, buildTimeSlots(schedule, provider_breaks, service_duration, timeslots));
        });

    }

    function buildTimeSlots(schedule, provider_breaks, service_duration, reserved_timeslots) {

        var timeslots = [];

        var schedule_start = new XDate('1/1/2000 ' + schedule.start, false);
        var schedule_end = new XDate('1/1/2000 ' + schedule.end, false);

        while(schedule_start <= schedule_end) {

            var start = new XDate(schedule_start).getTime();
            var end = new XDate(schedule_start).addMinutes(service_duration.duration_minutes + service_duration.padding_after_minutes).getTime();
            var valid = true;

            _.each(provider_breaks, function(provider_break) {
                var break_start = new XDate('1/1/2000 ' + provider_break.from, false).getTime();
                var break_to = new XDate('1/1/2000 ' + provider_break.to, false).getTime();

                if (break_start >= start && break_start <= end) {
                    valid = false;
                    return;
                }
                if (break_to >= start && break_to <= end) {
                    valid = false;
                    return;
                }
            });

            if (end > schedule_end.getTime()) {
                valid = false;
            }

            if (valid) {
                timeslots.push(schedule_start.toString("HH:mm:TT"));
            }
            schedule_start.addMinutes(service_duration.duration_minutes + service_duration.padding_after_minutes);

        }

        return timeslots;
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

