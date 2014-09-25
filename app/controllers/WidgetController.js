'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    Widget = require('../models/Widget'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * Widgets Controller
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
        var widgetService = Injct.getInstance('widgetService');

        widgetService.getWidgetsByAccountId(account_id, function(err, widgets) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            res.render('management/widget', {
                title: 'Widget Management',
                widgets: widgets
            });
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

        var account_id = req.user.account_id;
        var widgetService = Injct.getInstance('widgetService');

        var widget = new Widget({
            account_id: account_id,
            url: req.body.site_url
        });

        widgetService.updateWidget(widget, function (err, result) {

            if (err) {
                req.flash('errors', { msg: 'Error adding widget.' });
                res.redirect('/management/widget');
                return;
            }

            req.flash('success', { msg: 'Widget added.' });
            res.redirect('/management/widget');
        });

    });

};