'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * GET /management/providers
 * Provider management page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getProviders = function(req, res) {

    var account_id = req.user.account_id;
    var accountService = Injct.getInstance('accountService');

    res.render('management/providers', {
        title: 'Provider Management'
    });

};

/**
 * POST /management/provider
 * Save provider.
 *
 * @param request
 * @param response
 * @param callback
 */
var postProvider = function(req, res) {


};

Heisenberg.get('/management/providers', PassportConf.isAuthenticated, getProviders);
Heisenberg.post('/management/provider', PassportConf.isAuthenticated, postProvider);