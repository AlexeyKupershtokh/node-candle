var timers = require('./timers.js');
//var timers = require('timers');

var debug = require('debug')('candle');
var candle = function() {
    this.callbacks = {};
    this.id = 0;
};
candle.prototype.get_timeout = function(id) {
    var self = this;
    return function() { return self.timeout(id); };
};
candle.prototype.add = function(callback, timeout) {
    var id = ++this.id;
    debug('Added callback', 'id:', id, ', timeout:', timeout);
    var timer = timers.setTimeout(this.get_timeout(id), timeout);
    this.callbacks[id] = [callback, timer];
    return id;
};
candle.prototype.timeout = function(id) {
    debug('Callback timed out', 'id:', id);
    this.resolve(id, 'timeout');
};
candle.prototype.resolve = function(id, err, result) {
    debug('Callback resolved', 'id:', id);
    var l = arguments.length;
    var s = this.callbacks[id];
    if (s) {
        this.delete(id);
        var c = s[0];
        if (l == 1) c();
        else if (l == 2) c(err);
        else if (l == 3) c(err, result);
        else {
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            if (c) {
                c.apply(this, args);
            }
        }
    }
};
candle.prototype.delete = function(id) {
    if (this.callbacks[id] && this.callbacks[id][1]) {
        timers.clearTimeout(this.callbacks[id][1]);
    }
    delete this.callbacks[id];
};

module.exports.candle = candle;
