'use strict';

var Location = require('../models/Location.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var LocationRepository = function () {};
module.exports = LocationRepository;


/**
 * Finds a location by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
LocationRepository.prototype.getLocationById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Location.model().findById(id, fields, function (err, location) {

        if (err) {
            Logger.error("Error trying to find location by id %j", id, err);
            return callback(err);
        }

        if (!location) {
            Logger.error("Location not found", id);
            return callback(new Error('Location not found'));
        }

        callback(null, new Location(location.toObject()));

    });
};

/**
 * Get all locations by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
LocationRepository.prototype.getLocationsByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Location.model().find({account_id: account_id}, fields, function (err, locations) {

        if (err) {
            Logger.error("Error trying to get locations by account_id %j", account_id, err);
            return callback(err);
        }

        if (!locations) {
            Logger.error("No location for account found", account_id);
            return callback(new Error('No location for account found'));
        }

        callback(null, locations);

    });
};

/**
 * Save a location
 *
 * @param {Location} location
 * @param {Function(err, location)} callback
 */
LocationRepository.prototype.saveLocation = function (location, callback) {

    if (location._id) {

        var id = location._id;
        delete location._id;
        Location.model().findByIdAndUpdate(id, location, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        location.model().save(function (err, _location) {
            if (err) {
                return callback(err);
            }
            callback(null, new Location(_location));
        });

    }
};


