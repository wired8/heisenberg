'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport'),
    _ = require('underscore'),
    Async = require('async'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    Booking = require('../models/Booking.js'),
    TimeSlot = require('../models/TimeSlot.js'),
    Schedule = require('../models/Schedule.js'),
    XDate = require('xdate');


/**
 * Schedule Controller
 */

module.exports.controller = function (app) {

    /**
     * GET /schedule
     * Schedule page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/schedule', PassportConf.isAuthenticated, function (req, res) {

        res.render('schedule/schedule', {
            title: 'Schedule'
        });
    });

    /**
     * GET /api/bookings
     * Get schedule for auth user.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/api/bookings/:date/?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var bookingService = Injct.getInstance('bookingService');
        var providerService = Injct.getInstance('providerService');
        var serviceService = Injct.getInstance('serviceService');
        var timeSlotService = Injct.getInstance('timeSlotService');
        var bookings = [];
        var timeshift = req.query.timeshift;

        Async.waterfall([getServices, getProviders, getBookings,  getTimeSlots], render);

        function getServices(cb) {

            var services = [];

            serviceService.getServicesByAccountId(account_id, function(err, _services) {

                if (err) {
                    cb(err);
                    return;
                }

                _.each(_services, function(service) {
                    services.push({ key: service._id.toString(), label: service.name });
                });

                cb(null, services);
            });
        }

        function getProviders(services, cb) {

            if (services.length === 0) {
                res.send({
                    data: bookings,
                    collections: {
                        services: [],
                        providers: [],
                        timeslots: [],
                        units: []
                    }
                });
                return;
            }
            var service_id = services[0].key;

            providerService.getProvidersByServiceId(service_id, function(err, _providers) {
                if (err) {
                    cb(err);
                    return;
                }

                var providers = [];

                _.each(_providers, function(provider) {
                    providers.push({
                        key: provider._id.toString(),
                        label: provider.title + ' ' + provider.first_name + ' ' + provider.last_name,
                        name: provider.first_name + ' ' + provider.last_name
                    });
                });

                cb(null, services, providers);
            });
        }

        function getBookings(services, providers, cb) {

            var bookings = [];

            bookingService.getBookingsByAccountId(account_id, function (err, _bookings) {

                if (err) {
                    cb(err);
                    return;
                }

                //set id property for all records
                for (var i = 0; i < _bookings.length; i++) {
                    var booking = new Booking(_bookings[i]);
                    booking.id = _bookings[i]._id;
                    booking.text = booking.first_name + ' ' + booking.last_name;
                    booking.unit_id = booking.provider;
                    bookings.push(booking);
                }

                cb(null, services, providers, bookings);
            });
        }

        function getTimeSlots(services, providers, bookings, cb) {

            var service_id = services[0].key;
            var provider_id = providers[0].key;
            var date = new XDate();

            if (req.params.date !== undefined) {
                var str = req.params.date;
                var y = str.substr(0,4),
                    m = str.substr(4,2) - 1,
                    d = str.substr(6,2);
                var D = new Date(y,m,d);
                date = (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : new XDate();
            }

            timeSlotService.getAvailableTimeSlotsForProviderByDate(account_id, provider_id, service_id, date, function(err, _timeslots) {

                if (err) {
                    cb(err);
                    return;
                }

                var timeslots = [];

                _.each(_timeslots, function(timeslot) {
                    timeslots.push({ key: timeslot.key, label: timeslot.value });
                });

                cb(null, services, providers, bookings, timeslots)

            });
        }

        function render(err, services, providers, bookings, timeslots) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            res.send({
                data: bookings,
                collections: {
                    services: services,
                    providers: providers,
                    timeslots: timeslots,
                    units: providers
                }
            });
        }
    });

    /**
     * POST /management/schedule
     * Save a schedule for auth user.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/schedule', PassportConf.isAuthenticated, function (req, res) {
        var account_id = req.user.account_id;
        var serviceService = Injct.getInstance('serviceService');
        var bookingService = Injct.getInstance('bookingService');
        var timeSlotService = Injct.getInstance('timeSlotService');
        var data = req.body;
        var mode = data["!nativeeditor_status"];
        var sid = data.id;
        var tid = sid;

        var d = new XDate(data.start_date);
        var service_id = data.service;
        var start_date = new XDate(new XDate(data.start_date).toString("MMM d, yyyy") + ' ' + data.time_slots);

        Logger.info('Booking request: %j', Util.inspect(req.body));

        Async.waterfall([getService, updateTimeSlot, createBooking], update_response);

        function getService(cb) {
            serviceService.getServiceById(service_id, cb);
        }

        function updateTimeSlot(service, cb) {

            var end_date = new XDate(start_date).addMinutes((service.duration.hours * 60) +  (service.duration.minutes));

            var timeslot = new TimeSlot({
                provider_id: req.body.provider,
                start: start_date.getTime(),
                end: end_date.getTime()
            });

            timeSlotService.updateTimeSlot(timeslot, cb);
        }

        function createBooking(timeslot, cb) {

            delete data.id;
            delete data.gr_id;
            delete data["!nativeeditor_status"];

            var booking = new Booking({
                id: sid,
                account_id: account_id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                phone: req.body.phone,
                email: req.body.email,
                start_date: timeslot.start,
                end_date: timeslot.end,
                service: req.body.service,
                provider: req.body.provider
            });

            switch (mode) {
                case 'inserted':
                case 'updated':
                    bookingService.updateBooking(booking, cb);
                    break;
                case 'deleted':
                    bookingService.deleteBooking(booking, cb);
                    break;
            }
        }

        function update_response(err, result) {

            if (err) {
                mode = "error";
            } else if (mode == "inserted") {
                tid = result._id;
            }
            res.setHeader("Content-Type", "text/xml");
            res.send("<data><action type='" + mode + "' sid='" + sid + "' tid='" + tid + "'/></data>");
        }
    });


    /**
     * GET /management/schedule/settings
     * Schedule settings page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/schedule/settings', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var accountService = Injct.getInstance('accountService');
        var providerService = Injct.getInstance('providerService');
        var scheduleService = Injct.getInstance('scheduleService');

        Async.waterfall([getProviders, getSchedule], renderSchedule);

        function getProviders(cb) {
            providerService.getProvidersByAccountId(account_id, cb);
        }

        function getSchedule(providers, cb) {
            scheduleService.getScheduleByAccountId(account_id, function (err, schedule) {

                if (schedule === null) {

                    var provider_ids = _.pluck(providers, '_id');
                    var provider = {};

                    _.each(provider_ids, function (provider_id) {
                        provider[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '8:00',
                            end: '18:00'
                        };
                    });

                    var day = {
                        open: true,
                        start: '8:00',
                        end: '18:00',
                        providers: provider
                    };

                    schedule = new Schedule({
                        account_id: account_id,
                        monday: day,
                        tuesday: day,
                        wednesday: day,
                        thursday: day,
                        friday: day,
                        saturday: day,
                        sunday: day
                    });

                } else {

                    var provider_ids = _.pluck(providers, '_id');

                    _.each(provider_ids, function (provider_id) {

                        if (schedule.monday.providers[provider_id]) {
                            return;
                        }

                        schedule.sunday.providers[provider_id] =
                        schedule.saturday.providers[provider_id] =
                        schedule.friday.providers[provider_id] =
                        schedule.thursday.providers[provider_id] =
                        schedule.wednesday.providers[provider_id] =
                        schedule.tuesday.providers[provider_id] =
                        schedule.monday.providers[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '8:00',
                            end: '18:00'
                        };

                    });
                }

                var result = {};
                result.providers = providers;
                result.schedule = schedule;

                cb(null, result);
            });
        }

        function renderSchedule(err, result) {

            if (err) {
                Logger.error('Error getting schedule config', err);
                res.redirect('/error');
                return;
            }

            var startTime = new XDate(2014, 1, 1, 0, 0, 0, 0);
            var endTime = new XDate(2014, 1, 1, 23, 55, 0, 0);
            var step = 15;
            var hours = [];

            while (startTime.getTime() <= endTime.getTime()) {
                hours.push({value: startTime.toString("hh:mmTT"), key: startTime.toString("H:mm")});
                startTime = startTime.addMinutes(step);
            }

            res.render('management/schedule', {
                title: 'Schedule Settings Management',
                schedule: result.schedule,
                providers: result.providers,
                hours: hours
            });

        }
    });

    /**
     * POST /management/schedule/settings
     * Save schedule settings.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/schedule/settings', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var scheduleService = Injct.getInstance('scheduleService');

        var provider_ids = _.keys(req.body.provider_monday_start);
        var providers_monday = {};
        var providers_tuesday = {};
        var providers_wednesday = {};
        var providers_thursday = {};
        var providers_friday = {};
        var providers_saturday = {};
        var providers_sunday = {};

        _.each(provider_ids, function (provider_id) {
            providers_monday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_monday_open, provider_id) || req.body.provider_monday_open === provider_id,
                start: req.body.provider_monday_start[provider_id],
                end: req.body.provider_monday_end[provider_id]
            };
            providers_tuesday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_tuesday_open, provider_id) || req.body.provider_tuesday_open === provider_id,
                start: req.body.provider_tuesday_start[provider_id],
                end: req.body.provider_tuesday_end[provider_id]
            };
            providers_wednesday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_wednesday_open, provider_id) || req.body.provider_wednesday_open === provider_id,
                start: req.body.provider_wednesday_start[provider_id],
                end: req.body.provider_wednesday_end[provider_id]
            };
            providers_thursday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_thursday_open, provider_id) || req.body.provider_thursday_open === provider_id,
                start: req.body.provider_thursday_start[provider_id],
                end: req.body.provider_thursday_end[provider_id]
            };
            providers_friday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_friday_open, provider_id) || req.body.provider_friday_open === provider_id,
                start: req.body.provider_friday_start[provider_id],
                end: req.body.provider_friday_end[provider_id]
            };
            providers_saturday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_saturday_open, provider_id) || req.body.provider_saturday_open === provider_id,
                start: req.body.provider_saturday_start[provider_id],
                end: req.body.provider_saturday_end[provider_id]
            };
            providers_sunday[provider_id] = {
                _id: provider_id,
                available: _.contains(req.body.provider_sunday_open, provider_id) || req.body.provider_sunday_open === provider_id,
                start: req.body.provider_sunday_start[provider_id],
                end: req.body.provider_sunday_end[provider_id]
            };
        });

        var schedule = new Schedule({
            account_id: account_id,
            monday: {
                open: req.body.monday_open === 'on' ? true : false,
                start: req.body.monday_start,
                end: req.body.monday_end,
                providers: providers_monday
            },
            tuesday: {
                open: req.body.tuesday_open === 'on' ? true : false,
                start: req.body.tuesday_start,
                end: req.body.tuesday_end,
                providers: providers_tuesday
            },
            wednesday: {
                open: req.body.wednesday_open === 'on' ? true : false,
                start: req.body.wednesday_start,
                end: req.body.wednesday_end,
                providers: providers_wednesday
            },
            thursday: {
                open: req.body.thursday_open === 'on' ? true : false,
                start: req.body.thursday_start,
                end: req.body.thursday_end,
                providers: providers_thursday
            },
            friday: {
                open: req.body.friday_open === 'on' ? true : false,
                start: req.body.friday_start,
                end: req.body.friday_end,
                providers: providers_friday
            },
            saturday: {
                open: req.body.saturday_open === 'on' ? true : false,
                start: req.body.saturday_start,
                end: req.body.saturday_end,
                providers: providers_saturday
            },
            sunday: {
                open: req.body.sunday_open === 'on' ? true : false,
                start: req.body.sunday_start,
                end: req.body.sunday_end,
                providers: providers_sunday
            }
        });

        scheduleService.updateSchedule(schedule, function (err, schedule) {

            if (err) {
                req.flash('errors', { msg: 'Error updating schedule settings.' });
                res.redirect('/management/schedule/settings');
                return;
            }

            req.flash('success', { msg: 'Schedule settings updated.' });
            res.redirect('/management/schedule/settings/');
        });


    });

};

