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
 * GET /management/form
 * Form management page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getForm = function(req, res) {

    var account_id = req.user.account_id;
    var formService = Injct.getInstance('formService');

    formService.getFormByAccountId(account_id, function(err, form) {

        if (err) {
            res.send({ result: 'error', error: err });
            return;
        }

        res.render('management/form', {
            title: 'Form Management',
            form: form
        });

    });



};

/**
 * POST /management/form
 * Save form.
 *
 * @param request
 * @param response
 * @param callback
 */
var postForm = function(req, res) {

    var account_id = req.user.account_id;
    var formService = Injct.getInstance('formService');

    Logger.info(req.body);

    var form = new Form({
        account_id: account_id,
        fields: req.body.fields
    });

    formService.updateForm(form, function(err, result) {

        if (err) {
            req.flash('errors', { msg: 'Error updating form.' });
            res.redirect('/management/form');
            return;
        }

        req.flash('success', { msg: 'Form updated.' });
        res.redirect('/management/form');
    });


};

Heisenberg.get('/management/form', PassportConf.isAuthenticated, getForm);
Heisenberg.post('/management/form', PassportConf.isAuthenticated, postForm);