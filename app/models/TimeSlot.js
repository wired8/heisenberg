'use strict';

/**
 * TimeSlot model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var TimeSlotSchema = new Schema({
    provider_id: {type: String},
    start: {type: Number},
    end: {type: Number}
});

/**
 *
 * @param {Object} json
 *  {
 *      provider: String
 *      start: Number
 *      end: Number
 *  }
 * @constructor
 */
var TimeSlot = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.provider_id = json.provider_id;
    this.start = json.start;
    this.end = json.end;
};

var model = SchemaUtil.model('TimeSlot', TimeSlotSchema);

TimeSlot.prototype.model = function () {
    return new model(this);
};

TimeSlot.model = function () {
    return model;
};

module.exports = TimeSlot;
