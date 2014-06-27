"use strict";

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore');

//var is = require('is2');
var FileUtils = require('../../util/FileUtils');
var config = require('config');
var logger = require('morgan');

exports.ControllerManager = ControllerManager;

/**
 * @class
 * @description
 * Finds, loads, and initializes all controllers for an application.
 * @constructor
 * @param {string} controllerDir The directory to look in for controller modules.
 * implementation to use.  This is useful for testing.
 */
function ControllerManager(controllerDir) {

    this.controllerDir = controllerDir;

    // we want to add filters at the start. We may change how we add controllers, so we
    // want to know the filters up front before we load the controllers.
    //this.checkForFilters();
}

/**
 * Adds all of the controller endpoints under the controller/ directory.  Used by app.js to register all function
 * references on app start.
 * @private
 */
ControllerManager.prototype.loadControllers = function() {

    var files = FileUtils.listFiles(this.controllerDir,/Controller.js$/i);
    if(!files.length) {
        console.log('The controller directory, '+this.controllerDir+' is empty.');
        return;
    }

    var self = this;
    files.forEach(function(currFile) {
        console.log('Added controller:' + currFile);
        self.addController(currFile);
    });
};

ControllerManager.prototype.addController = function(param) {

    var routes;
    var file;

    // if the param is a string, we expect it's a file with a routes export
    if (typeof param === 'string') {
        file = param;
        if (!FileUtils.existsSync(file)) {
            console.log('ControllerManager.addController: received param string \''+file+'\', but no such file exists.');
            return false;
        }

        var module = require(file);
        routes = module.routes;

        if(!routes) {
            console.log('ControllerManager.addController: module '+file+' does not export any routes');
            return false;
        }
        // if the param is an object, we expect it to have a routes property
    } else if (typeof param === 'object') {
        routes = param;
        // if the param is neither an object or a string, we give up and return false
    } else {
        console.log('ControllerManager.addController: received a param that was neither a string nor an object: '+util.inspect(param));
        return false;
    }

    if (routes === undefined) {
        console.log('ControllerManager.addController: received routes from param that was undefined, param: '+util.inspect(param));
        return false;
    }

    if (typeof routes !== 'object') {
        console.log('ControllerManager.addController: received routes from param that was not an object, param: '+util.inspect(param));
        return false;
    }

    if (Object.keys(routes).length === 0) {
        console.log('ControllerManager.addController: received empty routes object from param: '+util.inspect(param));
        return false;
    }

    return true;
};


