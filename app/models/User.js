'use strict';

/**
 * User model
 */

var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js'),
    Bcrypt = require('bcrypt-nodejs'),
    Crypto = require('crypto');

var Schema = Mongoose.Schema;

var UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    password: String,
    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,

    profile: {
        name: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        picture: { type: String, default: '' }
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    created_at: Date

});

/**
 *
 * @param {Object} json
 *  {
 *      role: String
 *      description: String
 *      created_at: Number
 *  }
 * @constructor
 */
var User = function (json) {

    if (!json) {
        json = {};
    }

    if (json instanceof Mongoose.Model) {
        json = json.toObject();
    }

    if (json._id) {
        this._id = json._id;
    }

    this.email = json.email;
    this.password = json.password;
    this.facebook = json.facebook;
    this.twitter = json.twitter;
    this.google = json.google;
    this.tokens = json.tokens;

    this.profile = json.profile;
    this.resetPasswordToken = json.resetPasswordToken;
    this.resetPasswordExpires = json.resetPasswordExpires;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
};

var model = SchemaUtil.model('User', UserSchema);

User.prototype.model = function () {
    return new model(this);
};

User.model = function () {
    return model;
};

module.exports = User;




/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

UserSchema.pre('save', function(next) {
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

User.prototype.comparePassword = function(candidatePassword, cb) {
    Bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

User.prototype.gravatar = function(size) {
  if (!size) size = 200;

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }

  var md5 = Crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

