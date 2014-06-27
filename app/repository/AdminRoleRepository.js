'use strict';

var AdminRole = require('../models/AdminRole.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var AdminRoleRepository = function () {};
module.exports = AdminRoleRepository;

