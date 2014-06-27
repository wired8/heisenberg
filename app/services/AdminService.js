'use strict';

var Admin = require('../models/Admin.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * AdminService constructor
 *
 * @constructor
 */
var AdminService = function (adminRepository) {

    this.adminRepository = adminRepository;
    Injct.apply(this);
};
module.exports = AdminService;


/**
 * Gets the admin from mongo
 *
 * @param id string
 * @param callback
 */
AdminService.prototype.getAdminById = function (_id, callback) {
    this.adminRepository.getAdminById(_id, callback);
};


/**
 * Update a admin
 *
 * @param {Admin} admin
 * @param {Function} callback
 */
AdminService.prototype.updateAdmin = function(admin, callback) {
    this.adminRepository.saveAdmin(admin, callback);
};
