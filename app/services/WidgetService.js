'use strict';

var Widget = require('../models/Widget.js'),
    Injct = require('injct'),
    _ = require('underscore'),
    Constants = require('../util/Constants.js'),
    Logger = require('../util/Logger.js'),
    Util = require('util');

/**
 * WidgetService constructor
 *
 * @constructor
 */
var WidgetService = function (widgetRepository) {

    this.widgetRepository = widgetRepository;
    Injct.apply(this);
};
module.exports = WidgetService;


/**
 * Gets the widget from mongo
 *
 * @param id string
 * @param callback
 */
WidgetService.prototype.getWidgetById = function (_id, callback) {
    this.widgetRepository.getWidgetById(_id, callback);
};

/**
 * Get widgets by account id
 *
 * @param account_id string
 * @param callback
 */
WidgetService.prototype.getWidgetsByAccountId = function (account_id, callback) {
    this.widgetRepository.getWidgetsByAccountId(account_id, callback);
};


/**
 * Update a widget
 *
 * @param {Widget} widget
 * @param {Function} callback
 */
WidgetService.prototype.updateWidget = function(widget, callback) {
    this.widgetRepository.saveWidget(widget, callback);
};
