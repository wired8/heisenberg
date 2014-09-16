'use strict';

/*
 Mocha debugging script
 */

var Mocha = require('mocha'),
    path = require('path'),
    fs = require('fs');

var mocha = new Mocha({
    reporter: 'spec',
    ui: 'bdd',
    globals: 'logger',
    recursive: true,
    timeout: 10000
});

/*
 To debug all tests in a directory set mode to 'dir' and set the 'testDir' path.
 To debug a specific test set mode to 'file' and set the 'testFile' path/filename.
 */
var debugMode = 'file';
var testDir = './test/integration/';
var testFile = './test/integration/TimeSlotServiceTests.js';

if (debugMode === 'dir') {
    debugDir();
} else {
    debugFile();
}

function debugDir() {
    fs.readdir(testDir, function (err, files) {
        if (err) {
            console.log(err);
            return;
        }
        files.forEach(function (file) {
            if (path.extname(file) === '.js') {
                console.log('adding test file: %s', file);
                mocha.addFile(testDir + file);
            }
        });
        debug();
    });
}

function debugFile() {
    mocha.addFile(testFile);
    debug();
}

function debug() {
    var runner = mocha.run(function () {
        console.log('finished');
    });

    runner.on('pass', function (test) {
        console.log('... %s passed', test.title);
    });

    runner.on('fail', function (test) {
        console.log('... %s failed', test.title);
    });
}