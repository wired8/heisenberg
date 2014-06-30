'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport');

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

var getBookings = function(req, res, next) {
    var account_id = req.params.account_id;
    var bookingService = Injct.getInstance('bookingService');

    bookingService.getBookingsByAccountId(account_id, function(err, bookings) {

        //set id property for all records
        for (var i = 0; i < bookings.length; i++)
            bookings[i].id = bookings[i]._id;

        //output response
        res.send(bookings);

    });


};



Heisenberg.get('/', PassportConf.isAuthenticated, getSchedule);
Heisenberg.get('/api/bookings/:account_id', PassportConf.isAuthenticated, getBookings);


