'use strict';

/**
 * Widget model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var WidgetSchema = new Schema({
    account_id: {type: String, require: true, index: true },
    url: {type: String, required: true, index: true },
    width: {type: Number, default: 300},
    height: {type: Number, default: 400},
    theme: {type: String},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String
 *      url: String
 *      width: Number
 *      height: Number
 *      theme: String
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Widget = function (json) {

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
    this.url = json.url;
    this.width = json.width || 300;
    this.height = json.height || 400;
    this.theme = json.theme || '';

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Widget', WidgetSchema);

Widget.prototype.model = function () {
    return new model(this);
};

Widget.model = function () {
    return model;
};

module.exports = Widget;
