'use strict';

var Admin = require('../models/Admin.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var AdminRepository = function () {};
module.exports = AdminRepository;

