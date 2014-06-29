'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport');

/**
 * GET /settings
 * Settings page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getSettings = function(req, res) {

    res.render('settings', {
        title: 'Settings'
    });
};

/**
 * POST /settings
 * Save settings.
 *
 * @param request
 * @param response
 * @param callback
 */
var postSettings = function(req, res) {

    res.render('settings', {
        title: 'Settings'
    });
};




Heisenberg.get('/settings', PassportConf.isAuthenticated, getSettings);
Heisenberg.post('/settings', PassportConf.isAuthenticated, postSettings);




