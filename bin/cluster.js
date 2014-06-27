#!/usr/bin/env node
//# vi: ft=javascript

"use strict";

var util = require('util');
var recluster = require('recluster');
var path = require('path');
var fs = require('fs');
var args = require('optimist').argv;
var http = require('http');
var flagReload=true;

function usage() {
  console.log('Usage : ' + process.argv[1] + ' <filename> ');
  console.log('example : cluster app.js');
}

function killAll(signal) {
  util.log('Received ' + signal  + ' signal, signalling all worker processes...');
  process.kill(0, signal);
}

function startApp(filename) {

  var opts = { timeout: 30, respawn: 60 };
  var cluster  = recluster(filename,opts);
  var sighupSent = false;
  var restartFile = process.env.RESTARTFILE || './public/system/restart';

  cluster.run();

  process.on('SIGHUP', function(){
    if(!sighupSent) {
      sighupSent = true;
      killAll('SIGHUP'); 
      setTimeout(function() {
        sighupSent = false;
      }, 30000);
    }
  });

  process.on('SIGUSR2', function() {
    util.log('Restart signal received, reloading instances');
    cluster.reload();
  });

  process.on('SIGTERM', function(){
    util.log('TERM signal received, shutting down instances');
    cluster.terminate();
  });

  /**
    * Monitor the specified file for restart. If that file
    * is modified, shut down the current process instance.
    */
  fs.watchFile(restartFile, function(curr, prev) {
    util.log('Restart signal received, reloading instances');
    cluster.reload();
  });
}

(function main() {

  var argv = process.argv.slice(2);
  var filename = argv[0];

  if(argv.length == 0) {
    return usage();
  }

  console.log('starting ' + filename);

  fs.stat(filename,function(err,st) {

    if (/\.js$/.test(filename) == false) {
        filename += '.js';
    }

    if (filename[0] != '/') {
      filename = process.cwd() + '/' + filename;
    }

    startApp(filename);
  });

}());



