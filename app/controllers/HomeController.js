'use strict';

var Injct = require('injct');

/**
 * GET /
 * Home page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getHome = function(req, res) {

    res.render('home', {
        title: 'Home'
    });
};

Heisenberg.get('/home', getHome);



