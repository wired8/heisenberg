'use strict';

var util = require('util');

/**
 * Abstract Error for a better stack trace
 * @param msg
 * @param constr
 * @constructor
 */
var AbstractError = function (msg, constr) {

    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';
exports.AbstractError = AbstractError;

/**
 * Creates an http error class
 *
 * @param {String} statusLine
 * @param {Number} responseCode
 * @returns {Object} error object
 */
var createHttpError = function (statusLine, responseCode) {

    var obj = function (msg) {
        obj.super_.call(this, msg, this.constructor);
    };
    util.inherits(obj, AbstractError);

    obj.prototype.responseBody = function () {
        return {
            reason: {
                code: responseCode,
                message: statusLine
            },
            success: false
        };
    };
    obj.prototype.responseCode = function () {
        return responseCode;
    };
    return obj;
};

/**
 * Bad request
 *
 * @param {String} msg
 * @returns {BadRequest}
 */
exports.BadRequest = createHttpError('Bad request', 400);

/**
 * Unauthorized
 *
 * @param {String} msg
 * @returns {Unauthorized}
 */
exports.Unauthorized = createHttpError('Unauthorized', 401);

/**
 * Forbidden
 *
 * @param {String} msg
 * @returns {Forbidden}
 */
exports.Forbidden = createHttpError('Forbidden', 403);

/**
 * Conflict
 *
 * @param {String} msg
 * @returns {Conflict}
 */
exports.Conflict = createHttpError('Conflict', 409);

/**
 * Unexpected errors
 *
 * @returns {Unexpected}
 */
exports.Unexpected = createHttpError('Unexpected', 500);