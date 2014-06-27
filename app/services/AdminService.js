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

