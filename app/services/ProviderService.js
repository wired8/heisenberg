'use strict';

var Provider = require('../models/Provider.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * ProviderService constructor
 *
 * @constructor
 */
var ProviderService = function (providerRepository) {

    this.providerRepository = providerRepository;
    Injct.apply(this);
};
module.exports = ProviderService;


/**
 * Gets the provider from mongo
 *
 * @param id string
 * @param callback
 */
ProviderService.prototype.getProviderById = function (_id, callback) {
    this.providerRepository.getProviderById(_id, callback);
};

/**
 * Get providers by account id
 *
 * @param account_id string
 * @param callback
 */
ProviderService.prototype.getProvidersByAccountId = function (account_id, callback) {
    this.providerRepository.getProvidersByAccountId(account_id, callback);
};

/**
 * Get providers by service id
 *
 * @param service_id string
 * @param callback
 */
ProviderService.prototype.getProvidersByServiceId = function (service_id, callback) {
    this.providerRepository.getProvidersByServiceId(service_id, callback);
};


/**
 * Update a provider
 *
 * @param {Provider} provider
 * @param {Function} callback
 */
ProviderService.prototype.updateProvider = function(provider, callback) {
    this.providerRepository.saveProvider(provider, callback);
};


/**
 * Update services by provider
 *
 * @param [string] provider_ids
 * @param {string} service_id
 * @param {Function} callback
 */
ProviderService.prototype.updateAllProvidersService = function(provider_ids, service_id, callback) {
    this.providerRepository.updateAllProvidersService(provider_ids, service_id, callback);
};