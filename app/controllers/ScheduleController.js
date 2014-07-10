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
 * GET /management/schedule
 * Schedule page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getSchedule = function(req, res) {

    res.render('schedule', {
        title: 'Schedule'
    });
};

/**
 * GET /api/bookings
 * Get schedule for auth user.
 *
 * @param request
 * @param response
 * @param callback
 */
var getBookings = function(req, res, next) {
    var account_id = req.user.account_id;
    var bookingService = Injct.getInstance('bookingService');

    bookingService.getBookingsByAccountId(account_id, function(err, bookings) {

        //set id property for all records
        for (var i = 0; i < bookings.length; i++)
            bookings[i].id = bookings[i]._id;

        //output response
        res.send(bookings);

    });
};

/**
 * POST /management/schedule
 * Save a schedule for auth user.
 *
 * @param request
 * @param response
 * @param callback
 */
var postSchedule = function(req, res, next) {
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
    function update_response(err, result){
        if (err)
            mode = "error";
        else if (mode == "inserted")
            tid = data._id;

        res.setHeader("Content-Type","text/xml");
        res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
    }

    var booking = new Booking({
        _id: sid,
        account_id: account_id,
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        start_date: req.body.start_date,
        end_date: req.body.start_date,
        service: '',
        provider: ''
    });

    //run db operation
    switch (mode) {
        case 'inserted':
        case 'updated':
            bookingService.updateBooking(booking, update_response);
            break;
        case 'deleted':

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
};


/**
 * GET /management/scheduleSettings
 * Schedule settings page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getScheduleSettings = function(req, res) {

    var account_id = req.user.account_id;
    var accountService = Injct.getInstance('accountService');
    var providerService = Injct.getInstance('providerService');
    var scheduleService = Injct.getInstance('scheduleService');

    Async.parallel({providers: getProviders, schedule: getSchedule}, renderSchedule);

    function getProviders(cb) {
        providerService.getProvidersByAccountId(account_id, cb);
    }

    function getSchedule(cb) {
        scheduleService.getScheduleByAccountId(account_id, function(err, schedule) {

            if (schedule === null) {

                var day = {
                    open: false,
                    start: '0800',
                    end: '1800',
                    providers: []
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

            }

            cb(null, schedule);
        });
    }

    function renderSchedule(err, results) {

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
            schedule: results.schedule,
            providers: results.providers,
            hours: hours
        });

    }
};

/**
 * POST /management/schedule
 * Save schedule settings.
 *
 * @param request
 * @param response
 * @param callback
 */
var postScheduleSettings = function(req, res) {

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

    _.each(provider_ids, function(provider_id) {
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

    scheduleService.updateSchedule(schedule, function(err, schedule) {

        if (err) {
            req.flash('errors', { msg: 'Error updating schedule settings.' });
            res.redirect('/management/scheduleSettings');
            return;
        }

        req.flash('success', { msg: 'Schedule settings updated.' });
        res.redirect('/management/scheduleSettings/');
    });


};


Heisenberg.get('/', PassportConf.isAuthenticated, getSchedule);
Heisenberg.get('/management/schedule', PassportConf.isAuthenticated, getSchedule);
Heisenberg.post('/management/schedule', PassportConf.isAuthenticated, postSchedule);
Heisenberg.get('/management/scheduleSettings', PassportConf.isAuthenticated, getScheduleSettings);
Heisenberg.post('/management/scheduleSettings', PassportConf.isAuthenticated, postScheduleSettings);


