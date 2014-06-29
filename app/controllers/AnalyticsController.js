'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport');

/**
 * GET /
 * Analytics page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getAnalytics = function(req, res) {

    res.render('analytics', {
        title: 'Analytics'
    });
};

Heisenberg.get('/analytics', PassportConf.isAuthenticated, getAnalytics);



