'use strict';
var async = require('async');
var _und = require('underscore');
var path = require('path');

// for optional route error handler
var routeErrorHandlerPath = path.join(global.ngServer.application.root,'lib/routeErrorHandler.js');
exports.routeErrorHandler = undefined;
try {
    exports.routeErrorHandler = require(routeErrorHandlerPath);
} catch (err) {
}

/**
 * Given a handler function and optional 'pre' and 'post' functions this function will
 * return a single handler(req,res) function that correctly chains the provided
 * functions so they run in a series. Though all the parameters are actually passed in a
 * parameter object, the param documentation for this function describes the parameter
 * object.
 *
 * @param {function|function[]} aHandlerFn an HTTP handler function taking params (req,res,cb)
 * which are the standard node.js HTTP request and response objects plus a callback
 * to indicate when the handler function is completed.
 * @param {function|function[]} [beforeFns] Function(s) to run before aHandlerFn also
 * taking arguments (req,res,cb).
 * @param {function|function[]} [afterFns] Function(s) to run after aHandlerFn also
 * taking a arguments (req,res,cb).
 * @param {function} [requestCallback] A callback function that will be called when the
 * current HTTP request completes. It will be called with a single error argument
 * if an error occured.
 * @param {object} [filters] An object containing global filters. Optional.
 * @param {string[]} [excludeFilters] An optional array of strings indicating which set of globals filters
 * to NOT apply.
 * @returns {function} A function to execute when clients request the route.
 */
exports.chainRequestHandlers = function(params, cb) {
    if (!params) {
        logger.warn('chainRequestHandlers received NO paramters, returning null.');
        return null;
    }

    var util = require('util');
    var file = params.file || '(no file)';
    var routeName = params.routeName || '(no route)';
    var aHandlerFn = params.aHandlerFn;
    var beforeFns = params.beforeFns;
    var afterFns = params.afterFns;
    var filters = params.filters;
    var excludeFilters = params.excludeFilters || [];
    var excludeAllFilters = params.excludeAllFilters || false;
    var requestCallback = cb;

    logger.debug('chainRequestHandlers processing file: '+file+', routeName: '+routeName);

    if('function' !== typeof aHandlerFn && !_und.isArray(aHandlerFn)) {
        logger.warn('chainRequestHandlers received a bad aHandlerFn, route not processed. '+
            'aHandlerFn: '+typeof aHandlerFn+' : '+util.inspect(aHandlerFn));
        return null;
    }

    // normalize beforeFns and afterFns to arrays (they can be arrays or a single function)
    // we make them all arrays to simplify processing
    if (typeof aHandlerFn === 'function')
        aHandlerFn = [ aHandlerFn ];
    if (typeof afterFns === 'function')
        afterFns = [ afterFns ];
    if (typeof beforeFns === 'function')
        beforeFns = [ beforeFns ];

    // more normalization of inputs, it makes processing easier.
    if (filters) {
        if (filters.before && !_und.isArray(filters.before))
            filters.before = [ filters.before ];
        if (filters.around && !_und.isArray(filters.around))
            filters.around = [ filters.around ];
        if (filters.after && !_und.isArray(filters.after))
            filters.after = [ filters.after ];
    }

    // We place all the functions, global filters + route-specific function into
    // one of the two following arrays, beforeArray are functions that execute, in
    // order, before the route 'action' and after is the same, but after the route
    // 'action'.
    var beforeArray = [];
    var afterArray = [];

    // First we process the global before and around filters respectively
    if (! excludeAllFilters) {
        applyFilter(filters, 'before', routeName, excludeFilters, beforeArray);
        applyFilter(filters, 'around', routeName, excludeFilters, beforeArray);
    }

    // Handle the route's before functions
    // Then are the route-specific functions to run before aHandlerFn
    if (beforeFns && _und.isArray(beforeFns)) {
        beforeArray = beforeArray.concat(beforeFns);
    }

    // Handle the route's after functions
    // First are the controller-specific function that run after aHandlerFn
    if (afterFns && _und.isArray(afterFns)) {
        afterArray = afterArray.concat(afterFns);
    }

    // Next are the global around and after filters respectively
    if (! excludeAllFilters) {
        applyFilter(filters, 'around', routeName, excludeFilters, afterArray);
        applyFilter(filters, 'after',  routeName, excludeFilters, afterArray);
    }

    /* - Uncomment if you want to see what is running
     try {
     // debugging display functions to be run in order that they are run
     logger.debug('********************************************************************************');
     logger.debug('Before chain');
     beforeArray.forEach(function(element, index, array) {
     logger.debug(index + ':\n' + element.toString());
     });

     logger.debug('During chain');
     aHandlerFn.forEach(function(element, index, array) {
     logger.debug(index + ':\n' + element.toString());
     });

     logger.debug('After chain');
     afterArray.forEach(function(element, index, array) {
     logger.debug(index + ':\n' + element.toString());
     });
     logger.debug('********************************************************************************');
     } catch(err) {
     }
     */

    // We return a funtion to be executed when the route is requested by clients. 
    return function(req, res) {

        // process before, during and after functions
        function asyncApply(fn){ return async.apply(fn,req,res); }
        var funcChains = [beforeArray, aHandlerFn, afterArray].map(function(arr){
            return arr.map(function (fn){
                return async.apply(fn,req,res);
            });
        });

        // put them all together
        var funcChain = _und.flatten(funcChains);

        // execute the set of all functions and call the user-specified callback when done or
        // upon an error.
        function setUpAndCallChain() {
            async.series(
                funcChain,
                function(err){
                    requestCallback(err);
                    if (err && !res.headerSent) {
                        console.error('ERROR:'+util.inspect(err));
                        if (err.code) {
                            var message = err.responseMessage || err.message || 'Internal Server Error';
                            res.send(message, err.code);
                        } else {
                            res.send('Internal Server Error(500)', 500);
                        }
                    }
                }
            );
        }

        // create a domain to catch errors and pass data, if there is a route 
        // error handler
        if (global.ngServer.error && global.ngServer.error.routeErrorHandlerExists && exports.routeErrorHandler) {

            var ngRequest = require('../util/domain').create();

            // set the domain to catch any exceptions or errors
            ngRequest.on('error', function(err) {
                if (exports.routeErrorHandler.errorHandler) {
                    exports.routeErrorHandler.errorHandler(err, req, res, function(err) {
                        ngRequest.dispose();    // dispose of the domain
                    });
                } else {
                    ngRequest.dispose();    // dispose of the domain
                }
            });

            // run the express middleware in a domain because we have a route error handler
            ngRequest.run(setUpAndCallChain);
        } else {
            // Don't run the middleware in a domain, if there is no route error handler
            setUpAndCallChain();
        }
    };
};

/**
 * applyFilter applies a global filter for a single route and will exclude the application if
 * the route is in excludeFilters. If the route is included, the global filter's function is
 * placed in the function array.
 * @param {object} filters An object containing before, around and after filters, each with a
 * name and an action.
 * @param {string} whichFilter A string with either 'before', 'around' or 'after', to specifiy which
 * filter to process.
 * @param {string} routeName The name of the route being processed. This would be the path part of
 * the URL.
 * @param {string[]} excludeFilter An array of route names indicating which filters this route is
 * excluding.
 * @param {function[]} fnArray An array of functions to be run when clients request the route.
 */
function applyFilter(filters, whichFilter, routeName, excludeFilters, fnArray) {

    var util= require('util');

    // There may be no filters defined, or this filter may not be defined or
    // this filter may be in the set of excludeFilters for this route
    if (filters === undefined || filters[whichFilter] === undefined ||
        !PassesFilterQualifiers(routeName, filters[whichFilter])) {
        logger.debug('applyFilter not found: \''+whichFilter+'\' for route: '+routeName+'. '+
            'This is expected if you have no filters defined.');
        return;
    }

    // we really expected an array
    if (!_und.isArray(filters[whichFilter])) {
        logger.warn('applyFilter not found: \''+whichFilter+'\' for route: '+routeName+
            ' expected an array of filters, received: '+util.inspect(filters[whichFilter]));
        return;
    }

    logger.debug('applyFilter is processing '+whichFilter+' for route: '+routeName);

    // process each entry in this filter
    for (var i=0; i<filters[whichFilter].length; ++i) {
        // check if this filter's name is in the route's excludeFilters array, if so do not add it
        if (excludeFilters.indexOf(filters[whichFilter][i].name) === -1) {
            // now check if this route passes this filter's except/only clauses
            if (PassesFilterQualifiers(routeName, filters[whichFilter][i])) {
                logger.debug('Adding '+filters[whichFilter][i].name+' to route: '+routeName);
                fnArray.push(filters[whichFilter][i].action);
            } else {
                logger.debug('Excluding '+filters[whichFilter][i].name+' from route: '+routeName+' based on filter qualifiers (except/only)');
            }
        } else {
            logger.debug('Excluding '+filters[whichFilter][i].name+' from route: '+routeName+' due to route\'s exclude filters.');
        }
    }
}

/**
 * A convenience function to contain the logic for passing both except and only filters.
 * Remember, you can have only except or only qualifiers, not both. Passing the filter means
 * the function can be chained for execution.
 * @param {string} routeName The name of the route being tested for passing the filter.
 * @param {object} gfilter A global filter type either before, around or after.
 * @returns {boolean} True, if the function passes and can be chained, false otherwise.
 */
function PassesFilterQualifiers(routeName, filter) {
    var result = true;

    // A filter may be either a single object with the form: 
    // { 
    //      name: 'Filter Name',
    //      action: filterFunc, 
    //      except: [ routeName1, routeName2,...], 
    //      only: [ routeName1, routeName2,...]
    // };
    // Though you only have either an except or only, not both.
    //
    if (_und.isArray(filter)) {
        result = false;
        // We test every filter against the current route name, looking at the
        // except and only clauses. A single failure means do not process this route.
        for (var i=0; i<filter.length; ++i) {
            result |= CheckOneQualifier(routeName, filter[i]);
        }
    } else if (_und.isObject(filter)) {
        result = CheckOneQualifier(routeName, filter);
    }

    return result;
}

/**
 * For a given route name and filter, this function will check if the route
 * should be processed or excluded from processing, depending on the except and
 * only clauses in the given filter. If there is no filter or no except or only
 * clauses, then we process the route.
 * @param {string} routeName The name of the route, e.g. the path.
 * @param {object} filter One of the filter objects for before, around or after.
 * @returns {boolean} True, if the route should be processed and false otherwise.
 */
function CheckOneQualifier(routeName, filter) {

    var util = require('util');

    // if there is no filter, we should process the route
    if (!filter)
        return true;

    // if there are no except and no only qualifiers, process the route
    if (filter.except === undefined && filter.only === undefined)
        return true;

    // if there are exceptions and the exceptions are an array, then we
    // check if the route name is NOT in the index, and if so, we 
    // process the route.
    if (filter.except !== undefined && _und.isArray(filter.except)) {
        if (filter.except.indexOf(routeName) === -1) {
            return true;
        } else {
            return false;
        }
        // If there is an only clause and it's an array as we expect then
        // if the route is in the only filter, we process the route.
    } else if (filter.only !== undefined && _und.isArray(filter.only)) {
        if (filter.only.indexOf(routeName) > -1) {
            return true;
        } else {
            return false;
        }
    }

    return true; // return true because we can't filter on except or only
}
