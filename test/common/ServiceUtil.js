'use strict';

var _ = require('underscore'),
    TestUtil = require('../util.js'),
    Service = TestUtil.require('/models/Service.js'),
    ServiceService = TestUtil.require('/services/ServiceService.js'),
    ServiceService = TestUtil.require('/services/ServiceService.js'),
    Async = require('async'),
    Chance = require('chance');

var _chance = {};

var ServiceUtil = function() {
    _chance = new Chance();
};

/*
 Create n number of database services
 */
ServiceUtil.prototype.createServices = function(n, account_id, callback) {

    var services = [];

    Async.whilst(
        function () { return _.size(services) < n; },
        function(callback) {
            var s = new Service({
                account_id: account_id,
                name: _chance.word(),
                description: _chance.word(),
                duration: {
                    hours: 1,
                    minutes: 20
                },
                cost: '100.00',
                service_options: [],
                padding_before: {
                    hours: 0,
                    minutes: 0
                },
                padding_after: {
                    hours: 0,
                    minutes: 0
                },
                book_online: true,
                image_url: '',
                providers: [],
                order: 1,
                active: true,
                created_at: new Date().getTime()
            });

            new ServiceService().updateService(s, function (err, service) {
                if (err) {
                    console.log('create service error: %j', err);
                    return callback(err, null);
                }
                services.push(service);
                callback(null, service);
            });
        },
        function(err) {
            if (err) {
                console.log('create services error: %j', err);
                return callback(err, null);
            }
            callback(null, services);
        });
};

module.exports = ServiceUtil;


