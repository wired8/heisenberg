'use strict';

var Form = require('../models/Form.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var FormRepository = function () {};
module.exports = FormRepository;


/**
 * Finds a form by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
FormRepository.prototype.getFormById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Form.model().findById(id, fields, function (err, form) {

        if (err) {
            Logger.error("Error trying to find form by id %j", id, err);
            return callback(err);
        }

        if (!form) {
            Logger.error("Form not found", id);
            return callback(new Error('Form not found'));
        }

        callback(null, new Form(form.toObject()));

    });
};

/**
 * Get form by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
FormRepository.prototype.getFormByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Form.model().findOne({account_id: account_id}, fields, function (err, form) {

        if (err) {
            Logger.error("Error trying to find form by account_id %j", account_id, err);
            return callback(err);
        }

        callback(null, form);

    });
};

/**
 * Save a form
 *
 * @param {Form} form
 * @param {Function(err, form)} callback
 */
FormRepository.prototype.saveForm = function (form, callback) {

    Form.model().findOneAndUpdate({ account_id: form.account_id }, form, { upsert: true }, callback);
    /*
    if (form._id) {

        var id = form._id;
        delete form._id;
        Form.model().findByIdAndUpdate(id, form, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        form.model().save(function (err, _form) {
            if (err) {
                return callback(err);
            }
            callback(null, new Form(_form));
        });

    }
    */
};


