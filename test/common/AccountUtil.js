'use strict';

var _ = require('underscore'),
    TestUtil = require('../util.js'),
    Account = TestUtil.require('/models/Account.js'),
    AccountService = TestUtil.require('/services/AccountService.js'),
    Async = require('async'),
    Chance = require('chance');

var _chance = {};

var AccountUtil = function() {
    _chance = new Chance();
};

/*
 Create n number of database accounts
 */
AccountUtil.prototype.createAccounts = function(n, callback) {

    var accounts = [];

    Async.whilst(
        function () { return _.size(accounts) < n; },
        function(callback) {
            var p = new Account({
                name: _chance.name(),
                subdomain: _chance.word(),
                address: '',
                address_ext: '',
                phone: '555-555-5555',
                postal: '90210',
                country: 'USA',
                admins: [],
                account_options: {
                    booking: {
                        options: {
                            login_required: true,
                            admin_approved: true,
                            max_per_user_day: 10,
                            waiver_required: true,
                            private_only: false,
                            social_login: true,
                            enabled: true,
                            schedule_period: 0,
                            provider_selection: true,
                            provider_random: false
                        },
                        dates: {
                            first: {
                                fixed: false,
                                value: '',
                                enabled: false
                            },
                            last: {
                                fixed: false,
                                value: '',
                                enabled: false
                            }
                        }
                    },
                    schedule: {
                        rotate_period: 0,
                        start_period: 1
                    },
                    waiver: ''
                },
                billing: {
                    account_type: '',
                    billing_cycle: 0,
                    start_date: 0,
                    end_date: 0
                },
                enabled: true,
                created_at: new Date().getTime()
            });

            new AccountService().updateAccount(p, function (err, account) {
                if (err) {
                    console.log('create account error: %j', err);
                    return callback(err, null);
                }
                accounts.push(account);
                callback(null, account);
            });
        },
        function(err) {
            if (err) {
                console.log('create accounts error: %j', err);
                return callback(err, null);
            }
            callback(null, accounts);
        });
};

module.exports = AccountUtil;


