'use strict';

var Booking = require('../models/Booking.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * BookingService constructor
 *
 * @constructor
 */
var BookingService = function (bookingRepository) {

    this.bookingRepository = bookingRepository;
    Injct.apply(this);
};
module.exports = BookingService;


/**
 * Gets the booking from mongo
 *
 * @param id string
 * @param callback
 */
BookingService.prototype.getBookingById = function (_id, callback) {
    this.bookingRepository.getBookingById(_id, callback);
};


/**
 * Update a booking
 *
 * @param {Booking} booking
 * @param {Function} callback
 */
BookingService.prototype.updateBooking = function(booking, callback) {
    this.bookingRepository.saveBooking(booking, callback);
};
