'use strict';

/**
 * Service model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var ServiceSchema = new Schema({
    account_id: {type: String, require: true},
    name: {type: String, required: true},
    description: {type: String},
    duration: {
        hours: {type: Number},
        minutes: {type: Number}
    },
    cost: {type: String},
    service_options: Array,
    padding_before: {
        hours: {type: Number},
        minutes: {type: Number}
    },
    padding_after: {
        hours: {type: Number},
        minutes: {type: Number}
    },
    book_online: {type: Boolean, default: true},
    image_url: {type: String},
    providers: Array,
    order: {type: Number},
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
 *      description: String
 *      duration: Object
 *      cost: String
 *      service_options: Object
 *      padding_before: Object
 *      padding_after: Object
 *      book_online: Boolean
 *      image_url: String
 *      providers: Array
 *      order: Number
 *      active: Boolean
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Service = function (json) {

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
    this.description = json.description || '';
    this.duration = json.duration || { hours: 0, minutes: 0 };
    this.active = json.active || false;
    this.cost = json.cost || 0;
    this.service_options = json.service_options || [];
    this.padding_before = json.padding_before || { hours: 0, minutes: 0 };
    this.padding_after = json.padding_after || { hours: 0, minutes: 0 };
    this.book_online = json.book_online || true;
    this.image_url = json.image_url || '';
    this.order = json.order || 0;
    this.providers = json.providers || [];

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Service', ServiceSchema);

Service.prototype.model = function () {
    return new model(this);
};

Service.model = function () {
    return model;
};

module.exports = Service;
