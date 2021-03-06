'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Provider = require('../models/Provider'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util'),
    XDate = require('xdate'),
    Constants = require('../util/Constants'),
    Async = require('async');


/**
 * Provider Controller
 */

module.exports.controller = function (app) {

    /**
     * GET /api/providers
     * Provider management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/api/providers', PassportConf.isAuthenticated, function (req, res) {
        var limit = req.query.iDisplayLength;
        var skip = req.query.iDisplayStart;
        var aaData = [];
        var account_id = req.user.account_id;
        var providerService = Injct.getInstance('providerService');

        providerService.getProvidersByAccountId(account_id, function (err, providers) {

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
    });

    /**
     * GET /api/providers/:service_id
     * Provider management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/api/providers/:service_id', PassportConf.isAuthenticated, function (req, res) {
        var service_id = req.params.service_id;
        var providerService = Injct.getInstance('providerService');

        providerService.getProvidersByServiceId(service_id, function (err, _providers) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            var providers = [];

            _.each(_providers, function(provider) {
                providers.push({ key: provider._id, label: provider.title + ' ' + provider.first_name + ' ' + provider.last_name });
            });

            res.send(providers);
        });
    });

    /**
     * GET /management/providers
     * Provider management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/providers', function (req, res) {

        res.render('management/providers', {
            title: 'Provider Management'
        });
    });

    /**
     * GET /management/provider
     * Provider management page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/provider/:provider_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var provider_id = req.params.provider_id;
        var providerService = Injct.getInstance('providerService');
        var serviceService = Injct.getInstance('serviceService');
        var locationService = Injct.getInstance('locationService');

        Async.waterfall([getServices, getLocations, renderProviders], null);

        function getServices(cb) {
            serviceService.getServicesByAccountId(account_id, cb);
        }

        function getLocations(services, cb) {
            locationService.getLocationsByAccountId(account_id, function(err, locations) {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, services, locations);
            });
        }

        function renderProviders(services, locations, cb) {

            var startTime = new XDate(2014, 1, 1, 0, 0, 0, 0);
            var endTime = new XDate(2014, 1, 1, 23, 55, 0, 0);
            var step = 30;
            var breaks = ["none"];

            while (startTime.getTime() <= endTime.getTime()) {
                breaks.push(startTime.toString("hh:mmTT"));
                startTime = startTime.addMinutes(step);
            }

            var titles = Constants.PERSONAL_TITLES;

            var all_services = _.map(services, function (service) {
                return {
                    _id: service._id.toString(),
                    name: service.name,
                    service_options: service.service_options,
                    selected: false
                };
            });

            var all_locations = _.map(locations, function (location) {
                return {
                    _id: location._id.toString(),
                    name: location.name,
                    selected: false
                };
            });

            if (provider_id !== undefined) {

                providerService.getProviderById(provider_id, function (err, provider) {

                    _.each(all_services, function (service) {
                        if (_.contains(provider.services, service._id)) {
                            service.selected = true;
                        }
                    });

                    _.each(all_locations, function (location) {
                        if (_.contains(provider.locations, location._id)) {
                            location.selected = true;
                        }
                    });

                    if (err) {
                        res.send({ result: 'error', error: err });
                        return;
                    }
                    res.render('management/provider', {
                        title: 'Edit Provider',
                        personal_titles: titles,
                        provider: provider,
                        provider_breaks: breaks,
                        services: all_services,
                        locations: all_locations
                    });
                });
            } else {

                var provider = new Provider();

                res.render('management/provider', {
                    title: 'New Provider',
                    personal_titles: titles,
                    provider: provider,
                    provider_breaks: breaks,
                    services: all_services,
                    locations: all_locations
                });

            }
        }

    });

    /**
     * POST /management/provider
     * Save provider.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/provider/:provider_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var provider_id = req.params.provider_id;
        var providerService = Injct.getInstance('providerService');

        var breaks = {
            sunday: {
                from: req.body.break_sunday_from,
                to: req.body.break_sunday_to
            },
            monday: {
                from: req.body.break_monday_from,
                to: req.body.break_monday_to
            },
            tuesday: {
                from: req.body.break_tuesday_from,
                to: req.body.break_tuesday_to
            },
            wednesday: {
                from: req.body.break_wednesday_from,
                to: req.body.break_wednesday_to
            },
            thursday: {
                from: req.body.break_thursday_from,
                to: req.body.break_thursday_to
            },
            friday: {
                from: req.body.break_friday_from,
                to: req.body.break_friday_to
            },
            saturday: {
                from: req.body.break_saturday_from,
                to: req.body.break_saturday_to
            }
        };

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
            locations: Array.isArray(req.body.locations) ? req.body.locations: (req.body.locations !== undefined ? [req.body.locations] : []),
            services: Array.isArray(req.body.services) ? req.body.service: (req.body.services !== undefined ? [req.body.services] : []),
            breaks: breaks,
            active: req.body.active === 'on' ? true : false,
            active_from: req.body.active_from,
            active_to: req.body.active_from,
            holidays: req.body.holidays,
            not_available_message: req.body.not_available_message,
            book_online: req.body.book_online === 'on' ? true : false
        });

        providerService.updateProvider(provider, function (err, provider) {

            if (err) {
                req.flash('errors', { msg: 'Error updating provider.' });
                res.redirect('/management/providers');
                return;
            }

            req.flash('success', { msg: 'Provider updated.' });
            res.redirect('/management/provider/' + provider._id.toString());
        });
    });

};