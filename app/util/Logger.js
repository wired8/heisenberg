'use strict';

var Bunyan = require("bunyan"),
    PrettyStream = require('bunyan-prettystream');

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var Logger = Bunyan.createLogger({
        name: "heisenbergLogger",
        streams: [{
            level: 'debug',
            type: 'raw',
            stream: prettyStdOut
        }]
});

module.exports = Logger;