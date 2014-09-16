'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Service = require('../models/Service'),
    _ = require('underscore'),
    Async = require('async'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * Setting Controller
 */

module.exports.controller = function (app) {


    /**
     * GET /api/services
     * Service management list.
     *
     * @param request
     * @param response
     */
    app.get('/api/services', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var serviceService = Injct.getInstance('serviceService');

        serviceService.getServicesByAccountId(account_id, function(err, services) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            var test = [
                { key: 1, label: 'John Smith'}
            ];
            res.send(test);
        });
    });

    /**
     * GET /api/services
     * Service management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/services/list', PassportConf.isAuthenticated, function (req, res) {
        var limit = req.query.iDisplayLength;
        var skip = req.query.iDisplayStart;
        var aaData = [];
        var account_id = req.user.account_id;
        var serviceService = Injct.getInstance('serviceService');

        serviceService.getServicesByAccountId(account_id, function(err, services) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            _.each(services, function (service, i) {
                var data = {
                    DT_RowId: service._id,
                    DT_RowClass: 'gradeA',
                    _id: service._id,
                    name: service.name,
                    description: service.description,
                    duration: service.duration,
                    active: service.active,
                    created_at: service.created_at,
                    updated_at: service.updated_at
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
     * GET /management/services
     * Service management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/services', PassportConf.isAuthenticated, function (req, res) {

        res.render('management/services', {
            title: 'Service Management'
        });
    });

    /**
     * GET /management/service
     * Service management page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/service/:service_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var service_id = req.params.service_id;
        var serviceService = Injct.getInstance('serviceService');
        var providerService = Injct.getInstance('providerService');

        Async.waterfall([getProviders, renderService], null);

        function getProviders(cb) {
            providerService.getProvidersByAccountId(account_id, cb);
        }

        function renderService(providers, cb) {

            var hours = [];
            var minutes = [];

            for (var i=0; i<24; i++) {
                hours.push({key: i, value: i + ' hours'});
            }

            for (var j=0; j<60; j+=5) {
                minutes.push({key: j, value: j + ' minutes'});
            }

            var all_providers = _.map(providers, function(provider) {
                return {
                    _id: provider._id.toString(),
                    first_name: provider.first_name,
                    last_name: provider.last_name,
                    services: provider.services,
                    selected: false
                };
            });


            if (service_id !== undefined) {

                serviceService.getServiceById(service_id, function (err, service) {

                    if (err) {
                        res.send({ result: 'error', error: err });
                        return;
                    }

                    _.each(all_providers, function(provider) {
                        if (_.contains(provider.services, service_id)) {
                            provider.selected = true;
                        }
                    });

                    res.render('management/service', {
                        title: 'Edit Service',
                        service: service,
                        providers: all_providers,
                        hours: hours,
                        minutes: minutes
                    });
                });
            } else {

                var service = new Service();

                res.render('management/service', {
                    title: 'Edit Service',
                    service: service,
                    providers: all_providers,
                    hours: hours,
                    minutes: minutes
                });

            }
        }

    });

    /**
     * POST /management/service
     * Save service.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/service/:service_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var service_id = req.params.service_id;
        var serviceService = Injct.getInstance('serviceService');
        var providerService = Injct.getInstance('providerService');

        var service = new Service({
            _id: service_id !== 'undefined' ? service_id : undefined,
            account_id: account_id,
            name: req.body.name,
            cost: req.body.cost,
            description: req.body.description,
            duration: {
                hours: req.body.duration_hours,
                minutes: req.body.duration_minutes
            },
            padding_before: {
                hours: req.body.padding_before_hours,
                minutes: req.body.padding_before_minutes
            },
            padding_after: {
                hours: req.body.padding_after_hours,
                minutes: req.body.padding_after_minutes
            },
            active: req.body.active === 'on' ? true : false,
            service_options: req.body.service_options
        });

        Async.parallel({service: updateService, providers: updateProviders}, render);

        function updateService(cb) {
            serviceService.updateService(service, cb);
        }

        function updateProviders(cb) {
            var provider_ids = Array.isArray(req.body.providers) ? req.body.providers : (req.body.providers !== undefined ? [req.body.providers] : []);
            providerService.updateAllProvidersService(provider_ids, service_id, cb);
        }

        function render(err, result) {
            if (err) {
                req.flash('errors', { msg: 'Error updating service.' });
                res.redirect('/management/services');
                return;
            }

            req.flash('success', { msg: 'Service updated.' });
            res.redirect('/management/service/' + result.service._id.toString());
        }

    });

};