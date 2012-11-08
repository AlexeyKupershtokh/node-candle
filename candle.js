/*jslint indent: 4 */
"use strict";

//var timers = require('timers');
var timers = require('./timers.js'); // use optimized version of node's timers.js
var util = require('util');
var debug = require('debug')('candle');

var Timeout = function () {};

var TimeoutError = function () {
    Error.captureStackTrace(this, TimeoutError);
};
util.inherits(TimeoutError, Error);
TimeoutError.prototype.name = 'TimeoutError';

var Candle = function () {
    this.callbacks = Object.create(null);
    this.id = 0;
    this.timeoutResolver = null;
};
Candle.prototype.add = function (callback) {
    var id = ++this.id;
    debug('add(...), assigned id = ' + id);
    this.callbacks[id] = [callback, null];
    return id;
};
Candle.prototype.resolve = function (id, err, result) {
    debug('resolve(' + id + ', ...)');
    var l = arguments.length, callback = this.callbacks[id], i, args;
    if (callback && callback[0]) {
        this.remove(id);
        if (l === 1) {
            callback[0]();
        } else if (l === 2) {
            callback[0](err);
        } else if (l === 3) {
            callback[0](err, result);
        } else {
            args = new Array(l - 1);
            for (i = 1; i < l; i++) { args[i - 1] = arguments[i]; }
            callback[0].apply(this, args);
        }
    }
};
Candle.prototype.remove = function (id) {
    debug('remove(' + id + ')');
    this.clearTimeout(id);
    delete this.callbacks[id];
};
Candle.prototype.setTimeout = function (id, timeout) {
    debug('setTimeout(' + id + ')');
    if (!this.callbacks[id]) { return; }
    this.clearTimeout(id);
    this.callbacks[id][1] = timers.setTimeout(this.getTimeout(id), timeout);
};
Candle.prototype.clearTimeout = function (id) {
    debug('clearTimeout(' + id + ')');
    if (this.callbacks[id] && this.callbacks[id][1]) {
        timers.clearTimeout(this.callbacks[id][1]);
    }
    this.callbacks[id][1] = null;
};
Candle.prototype.getTimeout = function (id) {
    var self = this;
    return function () { return self.onTimeout(id); };
};
Candle.prototype.onTimeout = function (id) {
    debug('onTimeout(' + id + ')');
    if (typeof this.timeoutResolver === 'function') {
        this.timeoutResolver(id);
    } else {
        this.resolve(id, new Timeout());
    }
};
Candle.prototype.setTimeoutResolver = function (callback) {
    this.timeoutResolver = callback;
};
var create = function () {
    return new Candle();
};

module.exports = Candle;
module.exports.create = create;
module.exports.Timeout = Timeout;
module.exports.TimeoutError = TimeoutError;
