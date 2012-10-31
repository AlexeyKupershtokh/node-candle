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
    var timer = setTimeout(this.get_timeout(id), timeout);
    this.callbacks[id] = [callback, timer];
    return id;
};
candle.prototype.timeout = function(id) {
    this.resolve(id, 'timeout');
};
candle.prototype.resolve = function(id, err) {
    var l = arguments.length;
    var s = this.callbacks[id];
    if (s) {
        this.delete(id);
        var c = s[0];
        if (l == 1) c();
        else if (l == 2) c(arguments[1]);
        else if (l == 3) c(arguments[1], arguments[2]);
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
        clearTimeout(this.callbacks[id][1]);
    }
    delete this.callbacks[id];
};

module.exports.candle = candle;
