'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Provider = require('../models/Provider'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    XDate = require('xdate');


/**
 * GET /api/providers
 * Provider management list.
 *
 * @param request
 * @param response
 * @param callback
 */
var getProviderData = function(req, res) {
    var limit = req.query.iDisplayLength;
    var skip = req.query.iDisplayStart;
    var aaData = [];
    var account_id = req.user.account_id;
    var providerService = Injct.getInstance('providerService');

    providerService.getProvidersByAccountId(account_id, function(err, providers) {

        if (err) {
            res.send({ result: 'error', error: err });
            return;
        }

        _.each(providers, function (provider, i) {
            var data = {
                DT_RowId: provider._id,
                DT_RowClass: 'gradeA',
                _id: provider._id,
                first_name: provider.first_name,
                last_name: provider.last_name,
                email: provider.email,
                active: provider.active,
                created_at: provider.created_at,
                updated_at: provider.updated_at
            };
            aaData.push(data);
        });

        res.send({ result: 'OK',
            flash: req.flash(),
            sEcho: req.query.sEcho,
            iTotalRecords: aaData.length,
            iTotalDisplayRecords: aaData.length,
            aaData: _.first(_.rest(aaData, skip), limit)
        });
    });
};

/**
 * GET /management/providers
 * Provider management list.
 *
 * @param request
 * @param response
 * @param callback
 */
var getProviders = function(req, res) {

    res.render('management/providers', {
        title: 'Provider Management'
    });
};

/**
 * GET /management/provider
 * Provider management page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getProvider = function(req, res) {

    var account_id = req.user.account_id;
    var provider_id = req.params.provider_id;
    var providerService = Injct.getInstance('providerService');

    var startTime  = new XDate(2014, 1, 1, 0, 0, 0, 0);
    var endTime    = new XDate(2014, 1, 1, 23, 55, 0, 0);
    var step = 30;
    var breaks  = ["none"];

    while (startTime.getTime() <= endTime.getTime()) {
        breaks.push(startTime.toString("hh:mmTT"));
        startTime = startTime.addMinutes(step);
    }


    if (provider_id !== undefined) {

        providerService.getProviderById(provider_id, function (err, provider) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }
            res.render('management/provider', {
                title: 'Edit Provider',
                provider: provider,
                provider_breaks: breaks
            });
        });
    } else {

        var provider = new Provider();

        res.render('management/provider', {
            title: 'New Provider',
            provider: provider,
            provider_breaks: breaks
        });

    }

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

    var account_id = req.user.account_id;
    var provider_id = req.params.provider_id;
    var providerService = Injct.getInstance('providerService');

    var provider = new Provider({
        _id: provider_id !== 'undefined' ? provider_id : undefined,
        account_id: account_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        title: req.body.title,
        bio: req.body.bio,
        image_url: req.body.image_url,
        password: req.body.password,
        services: req.body.services,
        breaks: req.body.breaks,
        active: req.body.active === 'on' ? true : false,
        active_from: req.body.active_from,
        active_to: req.body.active_from,
        holidays:  req.body.holidays,
        not_available_message: req.body.not_available_message,
        book_online: req.body.book_online === 'on' ? true : false
    });

    providerService.updateProvider(provider, function(err, provider) {

        if (err) {
            req.flash('errors', { msg: 'Error updating provider.' });
            res.redirect('/management/providers');
            return;
        }

        req.flash('success', { msg: 'Provider updated.' });
        res.redirect('/management/provider/' + provider._id.toString());
    });
};

Heisenberg.get('/management/provider/:provider_id?', PassportConf.isAuthenticated, getProvider);
Heisenberg.get('/management/providers', PassportConf.isAuthenticated, getProviders);
Heisenberg.get('/api/providers', PassportConf.isAuthenticated, getProviderData);
Heisenberg.post('/management/provider/:provider_id?', PassportConf.isAuthenticated, postProvider);