'use strict';

var Admin = require('../models/Admin.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var AdminRepository = function () {};
module.exports = AdminRepository;


/**
 * Finds a admin by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
AdminRepository.prototype.getAdminById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Admin.model().findById(id, fields, function (err, admin) {

        if (err) {
            Logger.error("Error trying to find admin by id %j", id, err);
            return callback(err);
        }

        if (!admin) {
            Logger.error("Admin not found", id);
            return callback(new Error('Admin not found'));
        }

        callback(null, new Admin(admin.toObject()));

    });
};

/**
 * Save a admin
 *
 * @param {Admin} admin
 * @param {Function(err, admin)} callback
 */
AdminRepository.prototype.saveAdmin = function (admin, callback) {

    if (admin._id) {

        var id = admin._id;
        delete admin._id;
        Admin.model().findByIdAndUpdate(id, admin, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        admin.model().save(function (err, _admin) {
            if (err) {
                return callback(err);
            }
            callback(null, new Admin(_admin));
        });

    }
};


