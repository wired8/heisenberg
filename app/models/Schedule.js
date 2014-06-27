'use strict';

/**
 * Schedule model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var ScheduleSchema = new Schema({
    monday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    tuesday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    wednesday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    thursday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    friday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    saturday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    sunday: {
        open: {type: Boolean},
        start: {type: Number},
        end: {type: Number},
        providers: [String]
    },
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      first_name: String
 *      last_name: String
 *      title: String
 *      bio: String
 *      image_url: String
 *      email: String
 *      password: String
 *      services: [String]
 *      breaks: Object
 *      active: Boolean
 *      active_from: Date
 *      active_to: Date
 *      not_available_message: String
 *      book_online: Boolean
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

    this.first_name = json.firstname;
    this.last_name = json.lastname;
    this.title = json.title;
    this.bio = json.bio;
    this.image_url = json.image_url;
    this.email = json.email;
    this.password = json.password;
    this.services = json.services;
    this.active = json.active || false;
    this.active_from = json.active_from;
    this.active_to = json.active_to;
    this.not_available_message = json.not_available_message;
    this.book_online = json.book_online;

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


