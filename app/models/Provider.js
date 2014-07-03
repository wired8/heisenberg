'use strict';

/**
 * Provider model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js'),
    Bcrypt = require('bcrypt-nodejs'),
    Crypto = require('crypto');

var Schema = Mongoose.Schema;

var ProviderSchema = new Schema({
    account_id: {type: String, require: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    title: {type: String},
    bio: {type: String},
    image_url: {type: String},
    email: {type: String, unique: true},
    password: {type: String},
    services: [String],
    breaks:[
        {
            day: Number,
            from: Number,
            to: Number
        }
    ],
    active: {type: Boolean, default: false},
    active_from: {type: Number},
    active_to: {type: Number},
    holidays: [
        {
            from: Number,
            to: Number
        }
    ],
    not_available_message: {type: String},
    book_online: {type: Boolean, default: true},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      account_id: String,
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
 *      active_from: Date,
 *      active_to: Date,
 *      holidays: Object
 *      not_available_message: String
 *      book_online: Boolean
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Provider = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.account_id = json.account_id || '';
    this.first_name = json.first_name || '';
    this.last_name = json.last_name || '';
    this.title = json.title || '';
    this.bio = json.bio || '';
    this.image_url = json.image_url || '';
    this.email = json.email || '';
    this.password = json.password || '';
    this.services = json.services || [];
    this.active = json.active || false;
    this.active_from = json.active_from || -1;
    this.active_to = json.active_to || -1;
    this.holidays = json.holidays || {};
    this.not_available_message = json.not_available_message || '';
    this.book_online = json.book_online || true;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Provider', ProviderSchema);

Provider.prototype.model = function () {
    return new model(this);
};

Provider.model = function () {
    return model;
};

module.exports = Provider;



/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

ProviderSchema.pre('save', function(next) {
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

Provider.prototype.comparePassword = function(candidatePassword, cb) {
    Bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

Provider.prototype.gravatar = function(size) {
    if (!size) size = 200;

    if (!this.email) {
        return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
    }

    var md5 = Crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};