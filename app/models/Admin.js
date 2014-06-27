'use strict';

/**
 * Admin model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var AdminSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    roles: [String],
    enabled: {type: Boolean, required: true},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      firstname: String
 *      lastname: String
 *      email: String
 *      password: String
 *      roles: [String]
 *      enabled: Boolean
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Admin = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.firstname = json.firstname;
    this.lastname = json.lastname;
    this.email = json.email;
    this.password = json.password;
    this.roles = json.roles;
    this.enabled = json.enabled || false;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Admin', AdminSchema);

Admin.prototype.model = function () {
    return new model(this);
};

Admin.model = function () {
    return model;
};

module.exports = Admin;
