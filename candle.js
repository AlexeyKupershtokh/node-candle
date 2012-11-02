var timers = require('./timers.js');
//var timers = require('timers');

var debug = require('debug')('candle');
var candle = function() {
    this.callbacks = Object.create(null);
    this.id = 0;
    this.timeoutResolver = null;
};
candle.prototype.add = function(callback) {
    var id = ++this.id;
    debug('add(...), assigned id = ' + id);
    this.callbacks[id] = [callback, null];
    return id;
};
candle.prototype.resolve = function(id, err, result) {
    debug('resolve(' + id + ', ...)');
    var l = arguments.length;
    var callback = this.callbacks[id];
    if (callback && callback[0]) {
        this.delete(id);
        if (l == 1) callback[0]();
        else if (l == 2) callback[0](err);
        else if (l == 3) callback[0](err, result);
        else {
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            callback[0].apply(this, args);
        }
    }
};
candle.prototype.delete = function(id) {
    debug('delete(' + id + ')');
    this.clearTimeout(id);
    delete this.callbacks[id];
};
candle.prototype.setTimeout = function(id, timeout) {
    debug('setTimeout(' + id + ')');
    if (!this.callbacks[id]) return;
    this.clearTimeout(id);
    this.callbacks[id][1] = timers.setTimeout(this.getTimeout(id), timeout);
};
candle.prototype.clearTimeout = function(id) {
    debug('clearTimeout(' + id + ')');
    if (this.callbacks[id] && this.callbacks[id][1]) {
      timers.clearTimeout(this.callbacks[id][1]);
    }
    this.callbacks[id][1] = null;
};
candle.prototype.getTimeout = function(id) {
    var self = this;
    return function() { return self.onTimeout(id); };
};
candle.prototype.onTimeout = function(id) {
    debug('onTimeout(' + id + ')');
    if (typeof this.timeoutResolver == 'function') {
      this.timeoutResolver(id);
    } else {
      this.resolve(id, 'timeout');
    }
};
candle.prototype.setTimeoutResolver = function(callback) {
    this.timeoutResolver = callback;
};
module.exports.candle = candle;
