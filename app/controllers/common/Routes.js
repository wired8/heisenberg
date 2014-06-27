'use strict';


var Errors = require('./Errors.js'),
    Injct = require('injct'),
    Constants = require('../../util/Constants.js'),
    ErrorResponse = require('./ErrorResponse.js'),
    Config = require('config'),
    _ = require('underscore'),
    PassportConf = require('../../../config/passport');

/**
 * A simple filter to get the logged user from persistence/cache and store
 * this information on the request
 *
 * @param {Function} fn
 */
exports.authRequired = function (fn) {

    return {
        before: [checkUserSessionFilter],
        action: errorHandler(fn),
        authRequired: false
    };
};

/**
 * Handles a public URI
 *
 * @param {Function(req, res, cb)} fn
 */
exports.public = function (fn) {

    return {
        action: errorHandler(fn),
        authRequired: false
    };
};

/**
 * Default error handling
 *
 * @param {Function(req, res, cb)} fn
 */
var errorHandler = function (fn) {

    return function (req, res, cb) {
        fn(req, res, function (err, result) {
            if (err) {
                console.log("There was an error processing a route", err);
                sendError(err, res);
            }
            cb(err, result);
        });
    };
};

exports.errorHandler = errorHandler;

/**
 * Handles errors
 *
 * @param err
 * @param res
 */
function sendError(err, res) {

    if (err instanceof Errors.AbstractError) {
        res.send(err.responseBody(), err.responseCode());
    } else {
        res.send({success: false}, 500);
    }
}

/**
 * Verify for a user session and if that doesn't exist, send a SessionExpired error
 * @param req
 * @param res
 * @param next
 */
function checkUserSessionFilter(req, res, next) {

    PassportConf.isAuthenticated(req, res, next);


    /*if (!req.session.user) {

        //failover on mongo (memcached evicted)
        var oldSessionId = req.cookies['connect.sid'];
        Session.findOne({sid: oldSessionId}, function (err, session) {
            if (err || !session) {
                sendSessionExpiredError(res);
                return;
            }
            Injct.getInstance('userService').getUserById(session.uid, function (err, user) {
                if (err || !user) {
                    sendSessionExpiredError(res);
                    return;
                }
                req.session.user = user;
                next();
            });
        });

    } else {

        next();

    }

    function sendSessionExpiredError(res) {
        res.send(new ErrorResponse({code: "SessionExpired"}));
    }
     */

}
