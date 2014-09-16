'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Location = require('../models/Location'),
    _ = require('underscore'),
    Async = require('async'),
    Logger = require('../util/Logger'),
    Util = require('util');


/**
 * Location Controller
 */

module.exports.controller = function (app) {


    /**
     * GET /api/locations
     * Location management list.
     *
     * @param request
     * @param response
     */
    app.get('/api/locations', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var locationService = Injct.getInstance('locationService');

        locationService.getLocationsByAccountId(account_id, function(err, locations) {

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
     * GET /api/locations
     * Location management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/locations/list', PassportConf.isAuthenticated, function (req, res) {
        var limit = req.query.iDisplayLength;
        var skip = req.query.iDisplayStart;
        var aaData = [];
        var account_id = req.user.account_id;
        var locationService = Injct.getInstance('locationService');

        locationService.getLocationsByAccountId(account_id, function(err, locations) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }

            _.each(locations, function (location, i) {
                var data = {
                    DT_RowId: location._id,
                    DT_RowClass: 'gradeA',
                    _id: location._id,
                    name: location.name,
                    address: location.address,
                    active: location.active,
                    created_at: location.created_at,
                    updated_at: location.updated_at
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
     * GET /management/locations
     * Location management list.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/locations', PassportConf.isAuthenticated, function (req, res) {

        res.render('management/locations', {
            title: 'Location Management'
        });
    });

    /**
     * GET /management/location
     * Location management page.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.get('/management/location/:location_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var location_id = req.params.location_id;
        var locationService = Injct.getInstance('locationService');
        var providerService = Injct.getInstance('providerService');

        Async.waterfall([getProviders, renderLocation], null);

        function getProviders(cb) {
            providerService.getProvidersByAccountId(account_id, cb);
        }

        function renderLocation(providers, cb) {

            var all_providers = _.map(providers, function(provider) {
                return {
                    _id: provider._id.toString(),
                    first_name: provider.first_name,
                    last_name: provider.last_name,
                    locations: provider.locations,
                    selected: false
                };
            });

            if (location_id !== undefined) {

                locationService.getLocationById(location_id, function (err, location) {

                    if (err) {
                        res.send({ result: 'error', error: err });
                        return;
                    }

                    _.each(all_providers, function(provider) {
                        if (_.contains(provider.locations, location_id)) {
                            provider.selected = true;
                        }
                    });

                    res.render('management/location', {
                        title: 'Edit Location',
                        location: location,
                        providers: all_providers
                    });
                });
            } else {

                var location = new Location();

                res.render('management/location', {
                    title: 'Edit Location',
                    location: location,
                    providers: all_providers
                });
            }
        }
    });

    /**
     * POST /management/location
     * Save location.
     *
     * @param request
     * @param response
     * @param callback
     */
    app.post('/management/location/:location_id?', PassportConf.isAuthenticated, function (req, res) {

        var account_id = req.user.account_id;
        var location_id = req.params.location_id;
        var locationService = Injct.getInstance('locationService');
        var providerService = Injct.getInstance('providerService');

        var location = new Location({
            _id: location_id !== 'undefined' ? location_id : undefined,
            account_id: account_id,
            name: req.body.name,
            address: req.body.address,
            active: req.body.active === 'on' ? true : false
        });

        Async.parallel({location: updateLocation, providers: updateProviders}, render);

        function updateLocation(cb) {
            locationService.updateLocation(location, cb);
        }

        function updateProviders(cb) {
            var provider_ids = Array.isArray(req.body.providers) ? req.body.providers : (req.body.providers !== undefined ? [req.body.providers] : []);
            providerService.updateAllProvidersLocation(provider_ids, location_id, cb);
        }

        function render(err, result) {
            if (err) {
                req.flash('errors', { msg: 'Error updating location.' });
                res.redirect('/management/locations');
                return;
            }

            req.flash('success', { msg: 'Location updated.' });
            res.redirect('/management/location/' + result.location._id.toString());
        }

    });

};