'use strict';

/**
 * Form model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var FormSchema = new Schema({
    account_id: {type: String, require: true},
    fields: Schema.Types.Mixed,
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String,
 *      fields: Schema.Types.Mixed,
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Form = function (json) {

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
    this.fields = json.fields;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Form', FormSchema);

Form.prototype.model = function () {
    return new model(this);
};

Form.model = function () {
    return model;
};

module.exports = Form;



