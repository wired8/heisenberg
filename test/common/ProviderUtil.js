'use strict';

var _ = require('underscore'),
    TestUtil = require('../util.js'),
    Provider = TestUtil.require('/models/Provider.js'),
    ProviderService = TestUtil.require('/services/ProviderService.js'),
    ServiceService = TestUtil.require('/services/ServiceService.js'),
    Async = require('async'),
    Chance = require('chance');

var _chance = {};

var ProviderUtil = function() {
    _chance = new Chance();
};

/*
 Create n number of database providers
 */
ProviderUtil.prototype.createProviders = function(n, callback) {

    var providers = [];

    Async.whilst(
        function () { return _.size(providers) < n; },
        function(callback) {
            var p = new Provider({
                title: 'Mr',
                first_name: _chance.name(),
                last_name: _chance.name(),
                email: _chance.email(),
                created_at: new Date().getTime(),
                updated_at: new Date().getTime()
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
        function(err) {
            if (err) {
                console.log('create providers error: %j', err);
                return callback(err, null);
            }
            callback(null, providers);
        });
};

module.exports = ProviderUtil;


