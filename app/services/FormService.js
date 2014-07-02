'use strict';

var Form = require('../models/Form.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * FormService constructor
 *
 * @constructor
 */
var FormService = function (formRepository) {

    this.formRepository = formRepository;
    Injct.apply(this);
};
module.exports = FormService;


/**
 * Gets the form from mongo
 *
 * @param id string
 * @param callback
 */
FormService.prototype.getFormById = function (_id, callback) {
    this.formRepository.getFormById(_id, callback);
};

/**
 * Get a form by account id
 *
 * @param account_id string
 * @param callback
 */
FormService.prototype.getFormByAccountId = function (account_id, callback) {
    this.formRepository.getFormByAccountId(account_id, callback);
};


/**
 * Update a form
 *
 * @param {Form} form
 * @param {Function} callback
 */
FormService.prototype.updateForm = function(form, callback) {
    this.formRepository.saveForm(form, callback);
};
