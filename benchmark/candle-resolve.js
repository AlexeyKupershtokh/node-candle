var candle = require('..').candle;

var c = new candle();

var n = 0;
var noop = function() {};

var next = function() {
    c.add(noop, 1); // in order to keep timer linked list
    for (var i = 0; i < 3000; i++) {
        var id = c.add(function(err, result) {
            n++;
        }, 1);
        c.resolve(id, null, 'result');
    }
    setTimeout(next, 1);
};
next();

var start = Date.now();
setInterval(function() {
    var time = Date.now() - start;
    console.log(time / 1000, n, Math.round(n * 1000 / time));
}, 1000);
