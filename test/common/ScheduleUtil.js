'use strict';

var _ = require('underscore'),
    TestUtil = require('../util.js'),
    Schedule = TestUtil.require('/models/Schedule.js'),
    ScheduleService = TestUtil.require('/services/ScheduleService.js'),
    Async = require('async'),
    Chance = require('chance'),
    Injct = require('injct');

var _chance = {};

var ScheduleUtil = function() {
    _chance = new Chance();
};

/*
 Create n number of database schedules
 */
ScheduleUtil.prototype.createSchedules = function(n, account_id, providers, callback) {

    var schedules = [];

    Async.whilst(
        function () { return _.size(schedules) < n; },
        function(cb) {
            var s = new Schedule({
                account_id: account_id,
                monday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                tuesday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                wednesday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                thursday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                friday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                saturday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                sunday: {
                    open: true,
                    start: '9:00',
                    end: '18:00',
                    providers: providers
                },
                created_at: new Date().getTime()
            });
            Injct.getInstance('scheduleService').updateSchedule(s, function (err, service) {
                if (err) {
                    console.log('create service error: %j', err);
                    return callback(err, null);
                }
                schedules.push(service);
                cb();
            });
        },
        function(err) {
            if (err) {
                console.log('create schedules error: %j', err);
                return callback(err, null);
            }
            callback(null, schedules);
        });
};

module.exports = ScheduleUtil;



