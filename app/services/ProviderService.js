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
 * Update a provider
 *
 * @param {Provider} provider
 * @param {Function} callback
 */
ProviderService.prototype.updateProvider = function(provider, callback) {
    this.providerRepository.saveProvider(provider, callback);
};
