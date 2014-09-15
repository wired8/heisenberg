'use strict';

var Location = require('../models/Location.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * LocationService constructor
 *
 * @constructor
 */
var LocationService = function (locationRepository) {

    this.locationRepository = locationRepository;
    Injct.apply(this);
};
module.exports = LocationService;


/**
 * Gets the location from mongo
 *
 * @param id string
 * @param callback
 */
LocationService.prototype.getLocationById = function (_id, callback) {
    this.locationRepository.getLocationById(_id, callback);
};

/**
 * Get locations by account id
 *
 * @param account_id string
 * @param callback
 */
LocationService.prototype.getLocationsByAccountId = function (account_id, callback) {
    this.locationRepository.getLocationsByAccountId(account_id, callback);
};


/**
 * Update a location
 *
 * @param {Location} location
 * @param {Function} callback
 */
LocationService.prototype.updateLocation = function(location, callback) {
    this.locationRepository.saveLocation(location, callback);
};
