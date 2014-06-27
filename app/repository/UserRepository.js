'use strict';

var User = require('../models/User.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var UserRepository = function () {};
module.exports = UserRepository;


/**
 * Finds a user by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
UserRepository.prototype.getUserById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    User.model().findById(id, fields, function (err, user) {

        if (err) {
            Logger.error("Error trying to find user by id %j", id, err);
            return callback(err);
        }

        if (!user) {
            Logger.error("User not found", id);
            return callback(new Error('User not found'));
        }

        callback(null, new User(user.toObject()));

    });
};

/**
 * Save a user
 *
 * @param {User} user
 * @param {Function(err, user)} callback
 */
UserRepository.prototype.saveUser = function (user, callback) {

    if (user._id) {

        var id = user._id;
        delete user._id;
        User.model().findByIdAndUpdate(id, user, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        user.model().save(function (err, _user) {
            if (err) {
                return callback(err);
            }
            callback(null, new User(_user));
        });

    }
};


