'use strict';

var Injct = require('injct'),
    Passport = require('passport'),
    PassportConf = require('../../config/passport'),
    Account = require('../models/Account'),
    User = require('../models/User'),
    Countries = require('country-data'),
    _ = require('underscore');

/**
 * GET /settings
 * Settings page.
 *
 * @param request
 * @param response
 * @param callback
 */
var getSettings = function(req, res) {

    var account_id = req.user.account_id;
    var accountService = Injct.getInstance('accountService');

    accountService.getAccountById(account_id, function(err, account) {

        if (!account) {
            account = new Account();
        }

        res.render('settings', {
            title: 'Settings',
            account: account,
            countries: Countries.countries.all
        });

    });
};

/**
 * POST /settings
 * Save settings.
 *
 * @param request
 * @param response
 * @param callback
 */
var postSettings = function(req, res) {

    var accountService = Injct.getInstance('accountService');
    var userService = Injct.getInstance('userService');
    var user_id = req.user._id.toString();

    var account = new Account({
        _id: req.body.account_id !== 'undefined' ? req.body.account_id : undefined,
        name: req.body.name,
        address: req.body.address,
        address_ext: req.body.address_ext,
        country: req.body.country_code,
        phone: req.body.phone,
        postal: req.body.postal
    });

    if (!_.contains(account.admins, user_id)) {
        account.admins.push(user_id);
    }

    accountService.updateAccount(account, function(err, account) {

        if (err) {
            res.send( { result: 'error', error: err } );

        } else {

            userService.getUserById(user_id, function(err, _user) {

                var user = new User(_user);
                user.account_id = account._id.toString();

                userService.updateUser(user, function(err, result) {
                    if (err) {
                        req.flash('errors', { msg: 'Error updating account information.' });
                        res.redirect('/settings');
                        return;
                    }
                    req.flash('success', { msg: 'Account information updated.' });
                    res.redirect('/settings');
                });

            });
        }

    });
};

Heisenberg.get('/settings', PassportConf.isAuthenticated, getSettings);
Heisenberg.post('/settings', PassportConf.isAuthenticated, postSettings);




