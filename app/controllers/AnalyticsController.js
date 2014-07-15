'use strict';

var Injct = require('injct');



/**
 * Analytics Controller
 */

module.exports.controller = function (app) {

    /**
     * GET /
     * Analytics page.
     *
     * @param request
     * @param response
     */
    app.get('/analytics', function (req, res) {

        res.render('analytics/analytics', {
            title: 'Analytics'
        });

    });

};




