'use strict';

/**
 * Schedule model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var ScheduleSchema = new Schema({
    account_id: {type: String, require: true},
    monday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    tuesday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    wednesday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    thursday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    friday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    saturday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    sunday: {
        open: {type: Boolean},
        start: {type: String},
        end: {type: String},
        providers: Schema.Types.Mixed
    },
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String
 *      monday: Object
 *      tuesday: Object
 *      wednesday: Object
 *      thursday: Object
 *      friday: Object
 *      saturday: Object
 *      sunday: Object
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Schedule = function (json) {

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
    this.monday = json.monday;
    this.tuesday = json.tuesday;
    this.wednesday = json.wednesday;
    this.thursday = json.thursday;
    this.friday = json.friday;
    this.saturday = json.saturday;
    this.sunday = json.sunday;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Schedule', ScheduleSchema);

Schedule.prototype.model = function () {
    return new model(this);
};

Schedule.model = function () {
    return model;
};

module.exports = Schedule;


