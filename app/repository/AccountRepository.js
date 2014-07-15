'use strict';

var Account = require('../models/Account.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var AccountRepository = function () {};
module.exports = AccountRepository;


/**
 * Finds a account by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
AccountRepository.prototype.getAccountById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Account.model().findById(id, fields, function (err, account) {

        if (err) {
            Logger.error("Error trying to find account by id %j", id, err);
            return callback(err);
        }

        if (!account) {
            Logger.error("Account not found", id);
            return callback(new Error('Account not found'));
        }

        callback(null, new Account(account.toObject()));

    });
};

/**
 * Save a account
 *
 * @param {Account} account
 * @param {Function(err, account)} callback
 */
AccountRepository.prototype.saveAccount = function (account, callback) {

    if (account._id) {

        var id = account._id;
        delete account._id;
        Account.model().findByIdAndUpdate(id, account, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        account.model().save(function (err, _account) {
            if (err) {
                return callback(err);
            }
            callback(null, new Account(_account));
        });

    }
};

/**
 * Finds a account by subdomain
 *
 * @param {String} subdomain
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
AccountRepository.prototype.getAccountBySubdomain = function (subdomain, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Account.model().findOne({subdomain: subdomain}, fields, function (err, account) {

        if (err) {
            Logger.error("Error trying to find account by id %j", id, err);
            return callback(err);
        }

        if (!account) {
            return callback();
        }

        callback(null, new Account(account.toObject()));

    });
};


