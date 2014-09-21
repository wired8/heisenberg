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

    Async.waterfall([getAccountScheduleHours, getProviderBreaks, getServicePeriod,  getProviderReservedTimeSlots], callback);

    function getAccountScheduleHours(cb) {

        scheduleService.getScheduleByAccountId(accountId, function(err, weekly_schedule) {

            if (err) {
                cb(err);
                return;
            }

            if (!weekly_schedule) {
                callback(null, []);
                return;
            }

            var day = new XDate(date, true).getDay();

            var provider_ids = weekly_schedule[getDayName(day)].providers;

            var keys = Object.keys(provider_ids);
            var valid_provider = _.find(keys, function(provider_id) {
                return providerId === provider_id;
            });

            var schedule = weekly_schedule[getDayName(day)];

            if (!valid_provider) {
                callback('Invalid provider');
                return;
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

    function getProviderReservedTimeSlots(schedule, provider_breaks, service_duration, cb) {

        var day = new XDate(date).getDate();
        var month = new XDate(date).getMonth();
        var year = new XDate(date).getFullYear();

        var from = new XDate(year, month, day, 0, 0, 0, 0).getTime();
        var to = new XDate(year, month, day, 23, 59, 59, 59).getTime();

        self.timeSlotRepository.getTimeSlotsByProviderId(providerId, from, to, function(err, reserved_timeslots) {

            if (err) {
                cb(err);
                return;
            }

            cb(null, buildTimeSlots(schedule, provider_breaks, service_duration, reserved_timeslots));
        });

    }

    function buildTimeSlots(schedule, provider_breaks, service_duration, reserved_timeslots) {

        var timeslots = [];
        var d = new XDate(date);
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        var schedule_start = new XDate(curr_month + '/' + curr_date + '/' + curr_year + ' ' + schedule.start, false);
        var schedule_end = new XDate(curr_month + '/' + curr_date + '/' + curr_year + ' ' +  schedule.end, false);

        Logger.info('schedule_start %j', schedule_start.toString());

        while(schedule_start.getTime() <= schedule_end.getTime()) {

            var start = new XDate(schedule_start).getTime();
            var end = new XDate(schedule_start).addMinutes(service_duration.duration_minutes + service_duration.padding_after_minutes).getTime();
            var valid = true;

            _.each(provider_breaks, function(provider_break) {
                var break_start = new XDate(curr_month + '/' + curr_date + '/' + curr_year + ' ' + provider_break.from, false).getTime();
                var break_to = new XDate(curr_month + '/' + curr_date + '/' + curr_year + ' ' + provider_break.to, false).getTime();

                if (break_start >= start && break_start <= end) {
                    valid = false;
                    return;
                }
                if (break_to >= start && break_to <= end) {
                    valid = false;
                    return;
                }
            });

            _.each(reserved_timeslots, function(reserved_timeslot) {
                var timeslot_start = reserved_timeslot.start;
                var timeslot_end = reserved_timeslot.end;

                if (timeslot_start >= start && timeslot_start < end) {
                    valid = false;
                    return;
                }
                if (timeslot_end > start && timeslot_end <= end) {
                    valid = false;
                    return;
                }
            });

            if (end > schedule_end.getTime()) {
                valid = false;
            }

            if (valid) {
                timeslots.push({key: schedule_start.toString("HH:mm"), value: schedule_start.toString("HH:mm:TT")});
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
 * Delete a time slot by provider and start date
 *
 * @param {string} provider_id
 * @param {number} start_date
 * @param {Function} callback
 */
TimeSlotService.prototype.deleteTimeSlotByProviderStartDate = function(provider_id, start_date, callback) {
    this.timeSlotRepository.deleteTimeSlotByProviderStartDate(provider_id, start_date, callback);
};

