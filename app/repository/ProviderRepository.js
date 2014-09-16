'use strict';

var Provider = require('../models/Provider.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var ProviderRepository = function () {};
module.exports = ProviderRepository;


/**
 * Finds a provider by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ProviderRepository.prototype.getProviderById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Provider.model().findById(id, fields, function (err, provider) {

        if (err) {
            Logger.error("Error trying to find provider by id %j", id, err);
            return callback(err);
        }

        if (!provider) {
            Logger.error("Provider not found", id);
            return callback(new Error('Provider not found'));
        }

        callback(null, new Provider(provider.toObject()));

    });
};

/**
 * Get all providers by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ProviderRepository.prototype.getProvidersByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Provider.model().find({account_id: account_id}, fields, function (err, providers) {

        if (err) {
            Logger.error("Error trying to get providers by account_id %j", account_id, err);
            return callback(err);
        }

        if (!providers) {
            Logger.error("No provider for account found", account_id);
            return callback(new Error('No provider for account found'));
        }

        callback(null, providers);

    });
};

/**
 * Get all providers by service_id
 *
 * @param {String|HexId} service_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ProviderRepository.prototype.getProvidersByServiceId = function (service_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Provider.model().find({services: { "$in" : [service_id]} }, fields, function (err, providers) {

        if (err) {
            Logger.error("Error trying to get providers by service_id %j", service_id, err);
            return callback(err);
        }

        callback(null, providers);

    });
};

/**
 * Save a provider
 *
 * @param {Provider} provider
 * @param {Function(err, provider)} callback
 */
ProviderRepository.prototype.saveProvider = function (provider, callback) {

    if (provider._id) {

        var id = provider._id;
        delete provider._id;
        Provider.model().findByIdAndUpdate(id, provider, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        provider.model().save(function (err, _provider) {
            if (err) {
                return callback(err);
            }
            callback(null, new Provider(_provider));
        });

    }
};

/**
 * Update services by provider
 *
 * @param [string] provider_ids
 * @param {string} service_id
 * @param {Function} callback
 */
ProviderRepository.prototype.updateAllProvidersService = function(provider_ids, service_id, callback) {

    Provider.model().update( { }, { $pull: { services: { $eq: service_id } } }, { multi: true }, function(err, result) {
         if (err) {
             callback(err);
             return;
         }
         Provider.model().update( { _id: { $in: provider_ids } }, { push: { services: { $eq: service_id } } }, { multi: true }, callback);
    });
};


