'use strict';

var Service = require('../models/Service.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var ServiceRepository = function () {};
module.exports = ServiceRepository;


/**
 * Finds a service by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
ServiceRepository.prototype.getServiceById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Service.model().findById(id, fields, function (err, service) {

        if (err) {
            Logger.error("Error trying to find service by id %j", id, err);
            return callback(err);
        }

        if (!service) {
            Logger.error("Service not found", id);
            return callback(new Error('Service not found'));
        }

        callback(null, new Service(service.toObject()));

    });
};

/**
 * Save a service
 *
 * @param {Service} service
 * @param {Function(err, service)} callback
 */
ServiceRepository.prototype.saveService = function (service, callback) {

    if (service._id) {

        var id = service._id;
        delete service._id;
        Service.model().findByIdAndUpdate(id, service, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        service.model().save(function (err, _service) {
            if (err) {
                return callback(err);
            }
            callback(null, new Service(_service));
        });

    }
};


