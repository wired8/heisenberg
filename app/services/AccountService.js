'use strict';

var Account = require('../models/Account.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * AccountService constructor
 *
 * @constructor
 */
var AccountService = function (accountRepository) {

    this.accountRepository = accountRepository;
    Injct.apply(this);
};
module.exports = AccountService;


/**
 * Gets the account from mongo
 *
 * @param id string
 * @param callback
 */
AccountService.prototype.getAccountById = function (_id, callback) {
    this.accountRepository.getAccountById(_id, callback);
};


/**
 * Update a account
 *
 * @param {Account} account
 * @param {Function} callback
 */
AccountService.prototype.updateAccount = function(account, callback) {
    this.accountRepository.saveAccount(account, callback);
};
