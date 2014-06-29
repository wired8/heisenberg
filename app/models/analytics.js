'use strict';

/**
 * Analytics model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var AnalyticsSchema = new Schema({
    role: {type: String, required: true, unique: true},
    description: {type: String},
    created_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      role: String
 *      description: String
 *      created_at: Number
 *  }
 * @constructor
 */
var Analytics = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.role = json.role;
    this.description = json.description;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
};

var model = SchemaUtil.model('Analytics', AnalyticsSchema);

Analytics.prototype.model = function () {
    return new model(this);
};

Analytics.model = function () {
    return model;
};

module.exports = Analytics;
