"use strict";

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore');

var FileUtils = require('../../app/util/FileUtils');
var config = require('config');

exports.InitializerManager = InitializerManager;

function InitializerManager(initializerDir) {

    this.initializerDir = initializerDir;

    // we want to add filters at the start. We may change how we add controllers, so we
    // want to know the filters up front before we load the controllers.
    //this.checkForFilters();
}

InitializerManager.prototype.loadApplicationInitializers = function(cb) {

    console.log('Loading application initializers...');

    var async     = require('async');
    var assert    = require('assert');
    var path      = require('path');
    var util      = require('util');

    var appInitializers = FileUtils.listFiles(path.join(this.initializerDir),/^.*Initializer.js$/);
    if(!appInitializers.length) {
        console.log('The initializer directory, '+this.initializerDir+' is empty.');
        return;
    }

    // We need to create an array of functions with correctly bound
    // arguments. If we just passed a reference of require(files[i])
    // it would not work because the value of i is a reference, and
    // when the functions are run, the value of i would be the number
    // of sample initializers.

    var initArray = function(fileList){
        var initializerArray = [];
        if(!util.isArray(fileList)){
            return initializerArray;
        }
        fileList.forEach(function(file){
            initializerArray.push(function(cb){
                var filename = file.replace(/^.*[\\\/]/, '');
                var curModule = require(file);

                if('function' == typeof curModule['init']){
                    console.log('Running config initializer init() function in: ' + filename);
                    curModule.init(cb);
                } else {
                    console.log('Running config initializer: ' + filename);
                    cb();
                }
            });
        });
        return initializerArray;
    };

    var appInitArray = initArray(appInitializers);

    async.parallel(appInitArray, function(err, results) {
        if(err){
            console.log(err);
            console.log('\n========================================================='+
                '\n=== Heisenberg had error(s) in user-defined initializer ==='+
                '\n=== Please fix and try again                          ==='+
                '\n=========================================================');
            process.exit(1);
        }
        cb(null); // all initializers have run, execution can now proceed.
    });

};

