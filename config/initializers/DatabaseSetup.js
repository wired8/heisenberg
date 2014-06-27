'use strict';

var _ = require('underscore'),
    Async = require('async'),
    Admin = require('../../app/models/Admin.js'),
    Config = require('config'),
    Injct = require('injct');

/**
 * Default admin role
 * @const
 * @type {string}
 */
var ADMIN_ROLE = "admin";

/**
 * Initialize mongo db, create any necessary records.
 *
 */
function DatabaseSetup(cb) {

    var adminService = Injct.getInstance('adminService');

    Async.series([
        dropAdminRole,
        dropAdmin,
        createAdminRole,
        createAdminRootUser
    ], cb);

    /**
     * Drop the previous admin role
     *
     * @param callback
     */
    function dropAdminRole(callback) {
        adminService.dropAdminRole(ADMIN_ROLE, callback);
    }

    /**
     * Drop the previous admin user account
     *
     * @param callback
     */
    function dropAdmin(callback) {
        adminService.deleteAdminByEmail(Config.get('game').admin.username, callback);
    }

    /**
     * Creates the admin role again
     * @param callback
     */
    function createAdminRole(callback) {

        var adminrole = new AdminRole({
            role: ADMIN_ROLE,
            description: 'Administrator role'
        });

        adminService.saveAdminRole(adminrole, callback);
    }

    /**
     * Create the admin root user
     * @param callback
     */
    function createAdminRootUser(callback) {

        Logger.info("Creating admin root user.");

        var admin = new Admin({
            firstname: 'root',
            lastname: 'root',
            email: Config.get('game').admin.username,
            password: Config.get('game').admin.password,
            roles: ['admin'],
            enabled: true
        });
        adminService.saveAdmin(admin, callback);
    }

}

module.exports = DatabaseSetup;


