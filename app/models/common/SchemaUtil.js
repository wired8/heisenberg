'use strict';

var Mongoose = require('mongoose');

/**
 * Setup the model
 *
 * @param name
 * @param schema
 */
exports.model = function (name, schema) {

    return Mongoose.model(name, schema);
};

