'use strict';

/**
 * Booking model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var BookingSchema = new Schema({
    account_id: {type: String, require: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    phone: {type: String},
    email: {type: String},
    start_date: {type: Number},
    end_date: {type: Number},
    service: {type: String},
    provider: {type: String},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String
 *      first_name: String
 *      last_name: String
 *      phone: String
 *      email: String
 *      start_date: Date
 *      end_date: Date
 *      service: String
 *      provider: String
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Booking = function (json) {

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
    this.first_name = json.first_name;
    this.last_name = json.last_name;
    this.phone = json.phone;
    this.email = json.email;
    this.start_date = json.start_date;
    this.end_date = json.end_date;
    this.service = json.service;
    this.provider = json.provider;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Booking', BookingSchema);

Booking.prototype.model = function () {
    return new model(this);
};

Booking.model = function () {
    return model;
};

module.exports = Booking;



/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

BookingSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    Bcrypt.genSalt(5, function(err, salt) {
        if (err) return next(err);

        Bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */

Booking.prototype.comparePassword = function(candidatePassword, cb) {
    Bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

Booking.prototype.gravatar = function(size) {
    if (!size) size = 200;

    if (!this.email) {
        return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
    }

    var md5 = Crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};