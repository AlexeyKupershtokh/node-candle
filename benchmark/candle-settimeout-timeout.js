var candle = require('..').candle;

var c = new candle();

var n = 0;
var next = function() {
    for (var i = 0; i < 1000; i++) {
        var id = c.add(function(err, result) {
            n++;
        }, 1);
        c.setTimeout(id, 1);
    }
    process.nextTick(next, 1);
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

