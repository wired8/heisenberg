'use strict';

/**
 * Module Dependencies
 */

var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js'),
    Bcrypt = require('Bcrypt-nodejs'),
    Crypto = require('crypto');


var Schema = Mongoose.Schema;

/**
 * Define User Schema
 */

var UserSchema = new Schema({
  account_id: { type: String, index: true },
  email: { type: String, unique: true, index: true },
  password: { type: String },
  type: { type: String, default: 'user' },

  facebook: { type: String, unique: true, sparse: true },
  twitter: { type: String, unique: true, sparse: true },
  google: { type: String, unique: true, sparse: true },
  tokens: Array,

  profile: {
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' },
    phone: {
      work: { type: String, default: '' },
      home: { type: String, default: '' },
      mobile: { type: String, default: '' }
    }
  },

  roles: [String],

  activity: {
    date_established: { type: Date, default: Date.now },
    last_logon: { type: Date, default: Date.now },
    last_updated: { type: Date }
  },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  verified: { type: Boolean, default: true },
  verifyToken: { type: String },

  enhancedSecurity: {
    enabled: { type: Boolean, default: false },
    type: { type: String },  // sms or totp
    token: { type: String },
    period: { type: Number },
    sms: { type: String },
    smsExpires: { type: Date }
  }

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

    this.account_id = json.account_id || '';
    this.email = json.email;
    this.password = json.password;
    this.type = json.type;
    this.facebook = json.facebook;
    this.twitter = json.twitter;
    this.google = json.google;
    this.tokens = json.tokens || [];

    this.profile = json.profile || {};
    this.roles = json.roles || [];
    this.activity = json.activity || {};

    this.resetPasswordToken = json.resetPasswordToken || '';
    this.resetPasswordExpires = json.resetPasswordExpires || -1;

    this.verified = json.verified || false;
    this.verifyToken = json.verifyToken || '';
    this.enhancedSecurity = json.enhancedSecurity || {};

    var now = new XDate(true).getTime();

  //  this.created_at = json.created_at || now;
//    this.updated_at = json.updated_at || now;
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
 * Hash the password and sms token for security.
 */

UserSchema.pre('save', function (next) {

  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) {
    return next();
  } else {
    Bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
      if (err) {
        return next(err);
      }
      Bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  }

});

/**
 * Check the user's password
 */

User.prototype.comparePassword = function (candidatePassword, cb) {
  Bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

/**
 * Check user's SMS token
 */

User.prototype.compareSMS = function (candidateSMS, cb) {
  Bcrypt.compare(candidateSMS, this.enhancedSecurity.sms, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

/**
 *  Get a URL to a user's Gravatar email.
 */

User.prototype.gravatar = function (size, defaults) {
  if (!size) {
    size = 200;
  }
  if (!defaults) {
    defaults = 'retro';
  }
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=' + defaults;
  }
  var md5 = Crypto.createHash('md5').update(this.email);
  return 'https://gravatar.com/avatar/' + md5.digest('hex').toString() + '?s=' + size + '&d=' + defaults;
};

