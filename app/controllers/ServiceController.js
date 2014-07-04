'use strict';

var Injct = require('injct'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Service = require('../models/Service'),
    _ = require('underscore'),
    Logger = require('../util/Logger'),
    Util = require('util');

/**
 * GET /api/services
 * Service management list.
 *
 * @param request
 * @param response
 * @param callback
 */
var getServiceData = function(req, res) {
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
};

/**
 * GET /management/services
 * Service management list.
 *
 * @param request
 * @param response
 * @param callback
 */
var getServices = function(req, res) {

    res.render('management/services', {
        title: 'Service Management'
    });
};

/**
 * GET /management/service
 * Service management page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getService = function(req, res) {

    var account_id = req.user.account_id;
    var service_id = req.params.service_id;
    var serviceService = Injct.getInstance('serviceService');

    if (service_id !== undefined) {

        serviceService.getServiceById(service_id, function (err, service) {

            if (err) {
                res.send({ result: 'error', error: err });
                return;
            }
            res.render('management/service', {
                title: 'Edit Service',
                service: service
            });
        });
    } else {

        var service = new Service();

        res.render('management/service', {
            title: 'Edit Service',
            service: service
        });

    }

};

/**
 * POST /management/service
 * Save service.
 *
 * @param request
 * @param response
 * @param callback
 */
var postService = function(req, res) {

    var account_id = req.user.account_id;
    var service_id = req.params.service_id;
    var serviceService = Injct.getInstance('serviceService');

    var service = new Service({
        _id: service_id !== 'undefined' ? service_id : undefined,
        account_id: account_id,
        name: req.body.name,
        description: req.body.description,
        duration: req.body.duration,
        active: req.body.active === 'on' ? true : false
    });

    serviceService.updateService(service, function(err, service) {

        if (err) {
            req.flash('errors', { msg: 'Error updating service.' });
            res.redirect('/management/services');
            return;
        }

        req.flash('success', { msg: 'Service updated.' });
        res.redirect('/management/service/' + service._id.toString());
    });
};



Heisenberg.get('/management/service/:service_id?', PassportConf.isAuthenticated, getService);
Heisenberg.get('/management/services', PassportConf.isAuthenticated, getServices);
Heisenberg.get('/api/services', PassportConf.isAuthenticated, getServiceData);
Heisenberg.post('/management/service/:service_id?', PassportConf.isAuthenticated, postService);