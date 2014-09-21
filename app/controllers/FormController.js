'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    Form = require('../models/Form');

/**
 * Form Controller
 */

module.exports.controller = function (app) {


    /**
     * GET /management/bookingform
     * Form management page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/bookingform', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var formService = Injct.getInstance('formService');

        formService.getFormByAccountId(account_id, function (err, form) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            var form_fields = (form && form.fields !== undefined ? JSON.stringify(form.fields) : JSON.stringify([]));

            res.render('management/bookingform', {
                title: 'Form Management',
                form_fields: form_fields
            });

        });


    });

    /**
     * POST /management/form
     * Save form.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/bookingform', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var formService = Injct.getInstance('formService');

        Logger.info(req.body);

        var form = new Form({
            account_id: account_id,
            fields: req.body.fields
        });

        formService.updateForm(form, function (err, result) {

            if (err) {
                req.flash('errors', { msg: 'Error updating form.' });
                res.redirect('/management/bookingform');
                return;
            }

            req.flash('success', { msg: 'Form updated.' });
            res.redirect('/management/bookingform');
        });


    });
};
