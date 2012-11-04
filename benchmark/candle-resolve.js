var Candle = require('..').Candle;

var c = new Candle();

var n = 0;

var next = function() {
    var ids = [], l = 1000;
    for (var i = 0; i < l; i++) {
        var id = c.add(function(err, result) {
            n++;
        }, 1);
        ids.push(id);
    }
    for (var i = 0; i < l; i++) {
        c.resolve(ids[i], null, 'result');
    }
    process.nextTick(next);
};
next();

var start = Date.now();
var last = start;
var n_total = 0;
setInterval(function() {
    n_total += n;
    var time_curr = Date.now() - last;
    var time_total = Date.now() - start;
    console.log('curr', Math.round(n * 1000 / time_curr), 'ops/sec, avg', Math.round(n_total * 1000 / time_total), 'ops/sec,', Math.ceil(process.memoryUsage().heapUsed/(1<<20)), 'mb used');
    last = Date.now();
    n = 0;
}, 1000);
