"use strict";

var Util = require('util'),
    Path = require('path'),
    Async = require('async'),
    _ = require('underscore'),
    Logger = require('../../app/util/Logger');

var FileUtils = require('../../app/util/FileUtils');
var config = require('config');

exports.InitializerManager = InitializerManager;

function InitializerManager(initializerDir) {

    this.initializerDir = initializerDir;
}

InitializerManager.prototype.loadApplicationInitializers = function(cb) {

    Logger.info('Loading application initializers...');

    var appInitializers = FileUtils.listFiles(Path.join(this.initializerDir),/^.*Initializer.js$/);
    if(!appInitializers.length) {
        console.log('The initializer directory, '+this.initializerDir+' is empty.');
        return;
    }

    var initArray = function(fileList){
        var initializerArray = [];
        if(!Util.isArray(fileList)){
            return initializerArray;
        }
        fileList.forEach(function(file){
            initializerArray.push(function(cb){
                var filename = file.replace(/^.*[\\\/]/, '');
                var curModule = require(file);

                if('function' == typeof curModule['init']){
                    Logger.info('Running config initializer init() function in: ' + filename);
                    curModule.init(cb);
                } else {
                    Logger.info('Running config initializer: ' + filename);
                    cb();
                }
            });
        });
        return initializerArray;
    };

    var appInitArray = initArray(appInitializers);

    Async.parallel(appInitArray, function(err, results) {
        if(err){
            Logger.info(err);
            Logger.info('\n========================================================='+
                '\n=== Heisenberg had error(s) in user-defined initializer ==='+
                '\n=== Please fix and try again                          ==='+
                '\n=========================================================');
            process.exit(1);
        }
        cb(null);
    });

};

