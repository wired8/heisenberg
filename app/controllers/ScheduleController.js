'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport'),
    _ = require('underscore'),
    Async = require('async'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    Booking = require('../models/Booking.js'),
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
    app.get('/api/bookings/:timeshift?', PassportConf.isAuthenticated, function (req, res) {
        var account_id = req.user.account_id;
        var bookingService = Injct.getInstance('bookingService');
        var providerService = Injct.getInstance('providerService');
        var serviceService = Injct.getInstance('serviceService');
        var bookings = [];

        Async.waterfall([getServices, getProviders, getBookings], null);

        function getServices(cb) {
            serviceService.getServicesByAccountId(account_id, function(err, _services) {
                if (err) {
                    res.send({ result: 'error', error: err });
                    return;
                }
                var services = [];

                _.each(_services, function(service) {
                    services.push({ key: service._id.toString(), label: service.name });
                });

                cb(null, services);
            });
        }

        function getProviders(services, cb) {

            var service_id = services[0].key;

            providerService.getProvidersByServiceId(service_id, function(err, _providers) {
                if (err) {
                    res.send({ result: 'error', error: err });
                    return;
                }

                var providers = [];

                _.each(_providers, function(provider) {
                    providers.push({ key: provider._id, label: provider.title + ' ' + provider.first_name + ' ' + provider.last_name });
                });

                cb(null, services, providers);
            });
        }

        function getBookings(services, providers, cb) {
            bookingService.getBookingsByAccountId(account_id, function (err, _bookings) {

                //set id property for all records
                for (var i = 0; i < _bookings.length; i++) {
                    var booking = new Booking(_bookings[i]);
                    booking.id = _bookings[i]._id;
                    booking.text = booking.first_name + ' ' + booking.last_name;
                    bookings.push(booking);
                }
                //output response
                res.send({
                    data: bookings,
                    collections: {
                        services: services,
                        providers: providers
                    }
                });

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
        var bookingService = Injct.getInstance('bookingService');

        Logger.info(Util.inspect(req.body));

        var data = req.body;

        //get operation type
        var mode = data["!nativeeditor_status"];
        //get id of record
        var sid = data.id;
        var tid = sid;

        //remove properties which we do not want to save in DB
        delete data.id;
        delete data.gr_id;
        delete data["!nativeeditor_status"];


        //output confirmation response
        function update_response(err, result) {
            if (err)
                mode = "error";
            else if (mode == "inserted")
                tid = result._id;

            res.setHeader("Content-Type", "text/xml");
            res.send("<data><action type='" + mode + "' sid='" + sid + "' tid='" + tid + "'/></data>");
        }

        var booking = new Booking({
            id: sid,
            account_id: account_id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            email: req.body.email,
            start_date: new XDate(req.body.start_date).getTime(),
            end_date: new XDate(req.body.end_date).getTime(),
            service: 'ffff',
            provider: 'ffff'
        });

        //run db operation
        switch (mode) {
            case 'inserted':
            case 'updated':
                bookingService.updateBooking(booking, update_response);
                break;
            case 'deleted':
                bookingService.deleteBooking(booking, update_response);
                break;
            default:
                res.send("Not supported operation");
        }


        /*
         if (mode == "updated")
         db.event.updateById( sid, data, update_response);
         else if (mode == "inserted")
         db.event.insert(data, update_response);
         else if (mode == "deleted")
         db.event.removeById( sid, update_response);
         else


         bookingService.getBookingsByAccountId(account_id, function(err, bookings) {

         //set id property for all records
         for (var i = 0; i < bookings.length; i++)
         bookings[i].id = bookings[i]._id;

         //output response
         res.send(bookings);

         }); */
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

                    var providers_monday = {};
                    var providers_tuesday = {};
                    var providers_wednesday = {};
                    var providers_thursday = {};
                    var providers_friday = {};
                    var providers_saturday = {};
                    var providers_sunday = {};

                    _.each(provider_ids, function (provider_id) {
                        providers_monday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_tuesday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_wednesday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_thursday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_friday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_saturday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                        providers_sunday[provider_id] = {
                            _id: provider_id.toString(),
                            available: false,
                            start: '0800',
                            end: '1800'
                        };
                    });

                    var monday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_monday
                    };

                    var tuesday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_tuesday
                    };

                    var wednesday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_wednesday
                    };

                    var thursday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_thursday
                    };

                    var friday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_friday
                    };

                    var saturday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_saturday
                    };

                    var sunday = {
                        open: true,
                        start: '0800',
                        end: '1800',
                        providers: providers_sunday
                    };

                    schedule = new Schedule({
                        account_id: account_id,
                        monday: monday,
                        tuesday: tuesday,
                        wednesday: wednesday,
                        thursday: thursday,
                        friday: friday,
                        saturday: saturday,
                        sunday: sunday
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
                hours.push({value: startTime.toString("hh:mmTT"), key: startTime.toString("HHmm")});
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

