'use strict';

/**
 * Location model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var LocationSchema = new Schema({
    account_id: {type: String, require: true},
    name: {type: String, required: true},
    address: {type: String, required: true},
    active: {type: Boolean, default: false},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String
 *      name: String
 *      address: String
 *      active: Boolean
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Location = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.account_id = json.account_id;
    this.name = json.name || '';
    this.address = json.address || '';
    this.active = json.active || false;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Location', LocationSchema);

Location.prototype.model = function () {
    return new model(this);
};

Location.model = function () {
    return model;
};

module.exports = Location;
