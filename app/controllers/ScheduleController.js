'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    Booking = require('../models/Booking.js');

/**
 * GET /
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
 * POST /api/bookings
 * Save a booking for auth user.
 *
 * @param request
 * @param response
 * @param callback
 */
var postBooking = function(req, res, next) {
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


Heisenberg.get('/', PassportConf.isAuthenticated, getSchedule);
Heisenberg.get('/api/bookings', PassportConf.isAuthenticated, getBookings);
Heisenberg.post('/api/bookings', PassportConf.isAuthenticated, postBooking);


