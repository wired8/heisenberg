'use strict';

/**
 * Account model
 */
var Mongoose = require('mongoose'),
    XDate = require('xdate'),
    SchemaUtil = require('./common/SchemaUtil.js');

var Schema = Mongoose.Schema;

var AccountSchema = new Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    address_ext: {type: String, required: true},
    phone: {type: String, required: true},
    postal: {type: String},
    country: {type: String, required: true},
    admins: [String],
    options: {
        booking: {
            options: {
                login_required: {type: Boolean},
                admin_approved: {type: Boolean},
                max_per_user_day: {type: Number},
                waiver_required: {type: Boolean},
                private_only: {type: Boolean},
                social_login: {type: Boolean},
                enabled: {type: Boolean},
                schedule_period: {type: Number},
                provider_selection: {type: Boolean},
                provider_random: {type: Boolean}
            },
            dates: {
                first: {
                    fixed: {type: Boolean},
                    value: {type: String},
                    enabled: {type: Boolean}
                },
                last: {
                    fixed: {type: Boolean},
                    value: {type: String},
                    enabled: {type: Boolean}
                }
            }
        },
        schedule: {
            rotate_period: {type: Number},
            start_period: {type: Date}
        },
        waiver: {type: String}
    },
    billing: {
        account_type: {type: String, required: true},
        billing_cycle: {type: Number, required: true},
        start_date: {type: Date, required: true},
        end_date: {type: Date, required: true}
    },
    enabled: {type: Boolean, required: true},
    created_at: {type: Number, required: true},
    updated_at: {type: Number, required: true}
});

/**
 *
 * @param {Object} json
 *  {
 *      name: String
 *      address: String
 *      address_ext: String
 *      phone: String
 *      postal: String
 *      country: String
 *      admins: [String]
 *      options: Object
 *      billing: Object
 *      enabled: Boolean
 *      created_at: Number
 *      updated_at: Number
 *  }
 * @constructor
 */
var Account = function (json) {

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
    this.address = json.address;
    this.address_ext = json.address_ext;
    this.phone = json.phone;
    this.postal = json.postal;
    this.country = json.country;
    this.admins = json.admins;
    this.options = json.options;
    this.billing = json.billing;
    this.enabled = json.enabled || false;

    var now = new XDate(true).getTime();

    this.created_at = json.created_at || now;
    this.updated_at = json.updated_at || now;
};

var model = SchemaUtil.model('Account', AccountSchema);

Account.prototype.model = function () {
    return new model(this);
};

Account.model = function () {
    return model;
};

module.exports = Account;
