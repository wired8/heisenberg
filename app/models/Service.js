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
    active: {type: Boolean, default: false},
    cost: {type: String},
    options: Schema.Types.Mixed,
    padding_before: Number,
    padding_after: Number,
    book_online: {type: Boolean, default: true},
    image_url: {type: String},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      name: String
 *      description: String
 *      active: Boolean
 *      cost: String
 *      options: Object
 *      padding_before: Number
 *      padding_after: Number
 *      book_online: Boolean
 *      image_url: String
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

    this.name = json.name;
    this.description = json.description;
    this.active = json.active || false;
    this.cost = json.cost;
    this.options = json.options;
    this.padding_before = json.padding_before;
    this.padding_after = json.padding_after;
    this.book_online = json.book_online;
    this.image_url = json.image_url;

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



/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

ServiceSchema.pre('save', function(next) {
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

Service.prototype.comparePassword = function(candidatePassword, cb) {
    Bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

Service.prototype.gravatar = function(size) {
    if (!size) size = 200;

    if (!this.email) {
        return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
    }

    var md5 = Crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};