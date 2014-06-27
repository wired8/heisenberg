'use strict';

var Util = require('util'),
    Events = require('events');

var LoggerEventEmitter = function() {};
Util.inherits(LoggerEventEmitter, Events.EventEmitter);

var Logger = exports.Logger = new LoggerEventEmitter();

var LOG_LEVELS = ['debug','info','warn','error'];

LOG_LEVELS.forEach(function(level) {
    exports[level] = log(level);
});

function log(level) {

    return function(message) {

        var args = Array.prototype.slice.call(arguments, 1);
        if (level === 'error') {
            Logger.emit('_error', message, args);

            var formatted_message = Util.format.apply(null, arguments);
            logger.error(new Error(formatted_message).stack);
        }

        if (logger[level]) {
            args.unshift(message);
            logger[level].apply(logger, args);
        }

    };
}
