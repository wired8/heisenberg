'use strict';

var Injct = require('injct');


/**
 * Home Controller
 */

module.exports.controller = function (app) {

    /**
     * GET /
     * Home page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/', function (req, res) {

        res.render('home/home', {
            title: 'Home'
        });
    });

};



