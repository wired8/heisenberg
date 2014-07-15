'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * Analytics Controller
 */

module.exports.controller = function (app) {

    /**
     * GET /management/widget
     * Widget management page.
     *
     * @param request
     * @param response
     */
    app.get('/management/widget', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var accountService = Injct.getInstance('accountService');

        res.render('management/widget', {
            title: 'Widget Management'
        });

    });

    /**
     * POST /management/widget
     * Save widgets.
     *
     * @param request
     * @param response
     */
    app.post('/management/widget', PassportConf.isAuthenticated,  function (req, res) {


    });

};