'use strict';
var util = require('util'),
    Routes = require('./Routes.js');

/**
 * A controller loader for an easier use of controllers with DI
 *
 * @param clazz
 * @constructor
 */
var ControllerLoader = function(clazz) {
    this.routes = [];
    this.clazz = clazz;
    this.instance = new clazz();
};

module.exports = ControllerLoader;

/**
 * Post
 * @param uri
 * @returns {*}
 */
ControllerLoader.prototype.post = function(uri) {
    return this.returnOptions('POST', uri);
};

/**
 * Get
 * @param uri
 * @returns {*}
 */
ControllerLoader.prototype.get = function(uri) {
    return this.returnOptions('GET', uri);
};

/**
 * Put
 * @param uri
 * @returns {*}
 */
ControllerLoader.prototype.put = function(uri) {
    return this.returnOptions('PUT', uri);
};

/**
 * Delete
 * @param uri
 * @returns {*}
 */
ControllerLoader.prototype.delete = function(uri) {
    return this.returnOptions('DELETE', uri);
};

/**
 * Build
 * @param _exports
 */
ControllerLoader.prototype.build  = function(_exports) {

    var self = this;

    var _r = {};
    for (var key in self.routes) {
        var obj = self.routes[key];
        if (!_r[obj.type]) {
            _r[obj.type] = {};
        }

        var fn = self.instance[obj.fn].bind(self.instance);
        var wrapper = Routes[obj.wrapper];

        _r[obj.type][obj.uri] = wrapper.call(wrapper, fn);
    }

    _exports.routes = _r;
};

/**
 * Return options
 * @param type
 * @param uri
 * @returns {{authRequired: Function, public: Function}}
 */
ControllerLoader.prototype.returnOptions = function(type, uri) {
    var self = this;

    var option = {
        type: type,
        uri: uri
    };

    return {
        authRequired: createFilter('authRequired'),
        public: createFilter('public')
    };

    function createFilter(filter) {
        return function(fnName) {
            option.fn = fnName;
            option.wrapper = filter;
            self.routes.push(option);
        };
    }

};
