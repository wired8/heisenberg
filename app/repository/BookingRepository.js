'use strict';

var Booking = require('../models/Booking.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var BookingRepository = function () {};
module.exports = BookingRepository;


/**
 * Finds a booking by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
BookingRepository.prototype.getBookingById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Booking.model().findById(id, fields, function (err, booking) {

        if (err) {
            Logger.error("Error trying to find booking by id %j", id, err);
            return callback(err);
        }

        if (!booking) {
            Logger.error("Booking not found", id);
            return callback(new Error('Booking not found'));
        }

        callback(null, new Booking(booking.toObject()));

    });
};

/**
 * Get all bookings by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
BookingRepository.prototype.getBookingsByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Booking.model().find({account_id: account_id}, fields, function (err, bookings) {

        if (err) {
            Logger.error("Error trying to get bookings by account_id %j", account_id, err);
            return callback(err);
        }

        if (!bookings) {
            Logger.error("No booking for account found", account_id);
            return callback(new Error('No booking for account found'));
        }

        callback(null, bookings);

    });
};

/**
 * Save a booking
 *
 * @param {Booking} booking
 * @param {Function(err, booking)} callback
 */
BookingRepository.prototype.saveBooking = function (booking, callback) {

    if (booking._id) {

        var id = booking._id;
        delete booking._id;
        Booking.model().findByIdAndUpdate(id, booking, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        booking.model().save(function (err, _booking) {
            if (err) {
                return callback(err);
            }
            callback(null, new Booking(_booking));
        });

    }
};

/**
 * Delete a booking
 *
 * @param {Booking} booking
 * @param {Function(err, booking)} callback
 */
BookingRepository.prototype.deleteBooking = function (booking, callback) {

    if (booking.id) {

        Booking.model().remove({id: booking.id}, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });

    } else {

        callback('Booking doesnt have valid _id!');

    }
};


