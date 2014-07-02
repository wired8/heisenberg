'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * GET /management/services
 * Service management page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getServices = function(req, res) {

    var account_id = req.user.account_id;
    var serviceService = Injct.getInstance('serviceService');

    serviceService.getServicesByAccountId(account_id, function(err, services) {

        res.render('management/services', {
            title: 'Service Management',
            services: services
        });

    });
};

/**
 * POST /management/service
 * Save a service.
 *
 * @param request
 * @param response
 * @param callback
 */
var postService = function(req, res) {

};


Heisenberg.get('/management/services', PassportConf.isAuthenticated, getServices);
Heisenberg.post('/management/service', PassportConf.isAuthenticated, postService);
