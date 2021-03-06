'use strict';

var _ = require('underscore'),
    TestUtil = require('../util.js'),
    Provider = TestUtil.require('/models/Provider.js'),
    ProviderService = TestUtil.require('/services/ProviderService.js'),
    ServiceService = TestUtil.require('/services/ServiceService.js'),
    Async = require('async'),
    Chance = require('chance');

var _chance = {};

var ProviderUtil = function () {
    _chance = new Chance();
};

/*
 Create n number of database providers
 */
ProviderUtil.prototype.createProviders = function (n, account_id, services, callback) {

    var providers = [];

    var service_ids = _.map(services, function (service) {
        return service._id.toString();
    });

    Async.whilst(
        function () {
            return _.size(providers) < n;
        },
        function (callback) {
            var p = new Provider({
                account_id: account_id,
                first_name: _chance.word(),
                last_name: _chance.word(),
                title: 'Mr',
                bio: '',
                image_url: '',
                email: _chance.email(),
                password: '',
                services: service_ids,
                breaks: {
                    sunday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    monday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    tuesday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    wednesday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    thursday:  [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    friday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ],
                    saturday: [
                        {
                            from: '12:30',
                            to: '13:00'
                        },
                        {
                            from: '15:30',
                            to: '15:45'
                        }
                    ]
                },
                active: true,
                active_from: 0,
                active_to: 9,
                not_available_message: '',
                book_online: true,
                created_at: new Date().getTime()
            });

            new ProviderService().updateProvider(p, function (err, provider) {
                if (err) {
                    console.log('create provider error: %j', err);
                    return callback(err, null);
                }
                providers.push(provider);
                callback(null, provider);
            });
        },
        function (err) {
            if (err) {
                console.log('create providers error: %j', err);
                return callback(err, null);
            }
            callback(null, providers);
        });
};

module.exports = ProviderUtil;


