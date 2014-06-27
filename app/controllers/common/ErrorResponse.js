'use strict';

/**
 * Creates an error response
 *
 * @param {Object} reason
 * @constructor
 */
var ErrorResponse = function(reason) {

    this.success = false;
    this.reason = reason || {};
};

module.exports = ErrorResponse;