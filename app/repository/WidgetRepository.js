'use strict';

var Widget = require('../models/Widget.js'),
    Mongoose = require('mongoose'),
    _ = require('underscore'),
    Logger = require('../util/Logger.js'),
    Async = require('async'),
    Constants = require('../util/Constants.js');


var WidgetRepository = function () {};
module.exports = WidgetRepository;


/**
 * Finds a widget by id
 *
 * @param {String|HexId} id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
WidgetRepository.prototype.getWidgetById = function (id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Widget.model().findById(id, fields, function (err, widget) {

        if (err) {
            Logger.error("Error trying to find widget by id %j", id, err);
            return callback(err);
        }

        if (!widget) {
            Logger.error("Widget not found", id);
            return callback(new Error('Widget not found'));
        }

        callback(null, new Widget(widget.toObject()));

    });
};

/**
 * Get all widgets by account_id
 *
 * @param {String|HexId} account_id
 *
 * @param [String] fields
 *  the fields to return '_id name nickname'
 *
 * @param {Function} callback
 */
WidgetRepository.prototype.getWidgetsByAccountId = function (account_id, fields, callback) {

    if (typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    Widget.model().find({account_id: account_id}, fields, function (err, widgets) {

        if (err) {
            Logger.error("Error trying to get widgets by account_id %j", account_id, err);
            return callback(err);
        }

        if (!widgets) {
            Logger.error("No widget for account found", account_id);
            return callback(new Error('No widget for account found'));
        }

        callback(null, widgets);

    });
};

/**
 * Save a widget
 *
 * @param {Widget} widget
 * @param {Function(err, widget)} callback
 */
WidgetRepository.prototype.saveWidget = function (widget, callback) {

    if (widget._id) {

        var id = widget._id;
        delete widget._id;
        Widget.model().findByIdAndUpdate(id, widget, {}, function (err, result) {
            callback(err, result);
        });

    } else {

        widget.model().save(function (err, _widget) {
            if (err) {
                return callback(err);
            }
            callback(null, new Widget(_widget));
        });

    }
};


