'use strict';

var User = require('../models/User.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * UserService constructor
 *
 * @constructor
 */
var UserService = function (userRepository) {

    this.userRepository = userRepository;
    Injct.apply(this);
};
module.exports = UserService;


/**
 * Gets the user from mongo
 *
 * @param id string
 * @param callback
 */
UserService.prototype.getUserById = function (_id, callback) {
    this.userRepository.getUserById(_id, callback);
};


/**
 * Update a user
 *
 * @param {User} user
 * @param {Function} callback
 */
UserService.prototype.updateUser = function(user, callback) {
    this.userRepository.saveUser(user, callback);
}
