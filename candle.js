/*jslint indent: 4 */
var timers = require('./timers.js');
//var timers = require('timers');

var debug = require('debug')('candle');
var Candle = function () {
    "use strict";
    this.callbacks = Object.create(null);
    this.id = 0;
    this.timeoutResolver = null;
};
Candle.prototype.add = function (callback) {
    "use strict";
    var id = ++this.id;
    debug('add(...), assigned id = ' + id);
    this.callbacks[id] = [callback, null];
    return id;
};
Candle.prototype.resolve = function (id, err, result) {
    "use strict";
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
    "use strict";
    debug('remove(' + id + ')');
    this.clearTimeout(id);
    delete this.callbacks[id];
};
Candle.prototype.setTimeout = function (id, timeout) {
    "use strict";
    debug('setTimeout(' + id + ')');
    if (!this.callbacks[id]) { return; }
    this.clearTimeout(id);
    this.callbacks[id][1] = timers.setTimeout(this.getTimeout(id), timeout);
};
Candle.prototype.clearTimeout = function (id) {
    "use strict";
    debug('clearTimeout(' + id + ')');
    if (this.callbacks[id] && this.callbacks[id][1]) {
        timers.clearTimeout(this.callbacks[id][1]);
    }
    this.callbacks[id][1] = null;
};
Candle.prototype.getTimeout = function (id) {
    "use strict";
    var self = this;
    return function () { return self.onTimeout(id); };
};
Candle.prototype.onTimeout = function (id) {
    "use strict";
    debug('onTimeout(' + id + ')');
    if (typeof this.timeoutResolver === 'function') {
        this.timeoutResolver(id);
    } else {
        this.resolve(id, 'timeout');
    }
};
Candle.prototype.setTimeoutResolver = function (callback) {
    "use strict";
    this.timeoutResolver = callback;
};
module.exports.candle = Candle;
