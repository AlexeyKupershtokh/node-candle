var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite;
Candle = require('..').Candle;

//function noop() {};
noop = function() {}
var setup = function() { var c = new Candle; };
var teardown = function() { console.log(c.id, Object.keys(c.callbacks).length); };
var options = {
  setup: setup,
  //teardown: teardown,
  //onComplete: function () { console.log(this.compiled.toString()); }
};

suite
.add('warmup', function() {
  var d = Date.now();
})
.add('add + resolve', function() {
  var id = c.add(noop);
  c.resolve(id);
}, options)
.add('1000*add + 1000*resolve', function() {
  var c = new Candle;
  var ids = new Array(1000);
  for (var i = 0; i < 1000; i++) {
    var id = c.add(noop);
    ids[i] = id;
  }
  for (var i = 0; i < 1000; i++) {
    c.resolve(ids[i]);
  }
})
.add('1000*add + 1000*resolve(1)', function() {
  var c = new Candle;
  var ids = new Array(1000);
  for (var i = 0; i < 1000; i++) {
    var id = c.add(noop);
    ids[i] = id;
  }
  for (var i = 0; i < 1000; i++) {
    c.resolve(ids[i], 1);
  }
})
.add('1000*add + 1000*resolve(1, 2)', function() {
  var c = new Candle;
  var ids = new Array(1000);
  for (var i = 0; i < 1000; i++) {
    var id = c.add(noop);
    ids[i] = id;
  }
  for (var i = 0; i < 1000; i++) {
    c.resolve(ids[i], 1, 2);
  }
})
.add('1000*add + 1000*resolve(1, 2, 3, 4, 5)', function() {
  var c = new Candle;
  var ids = new Array(1000);
  for (var i = 0; i < 1000; i++) {
    var id = c.add(noop);
    ids[i] = id;
  }
  for (var i = 0; i < 1000; i++) {
    c.resolve(ids[i], 1, 2, 3, 4, 5);
  }
})
.add('add + setTimeout + resolve', function() {
  var id = c.add(noop);
  c.setTimeout(id, 1);
  c.resolve(id);
}, options)
.add('1000*add + 1000*setTimeout + 1000*resolve', function() {
  var c = new Candle;
  var ids = new Array(1000);
  for (var i = 0; i < 1000; i++) {
    var id = c.add(noop);
    ids[i] = id;
  }
  for (var i = 0; i < 1000; i++) {
    c.setTimeout(ids[i], 1);
  }
  for (var i = 0; i < 1000; i++) {
    c.resolve(ids[i]);
  }
})
.add('1000*(add + setTimeout) + 1000*timeout', function(deferred) {
  var c = new Candle;
  var n = 0;
  var ITERATIONS = 1000;
  for (var i = 0; i < ITERATIONS; i++) {
    var id = c.add(function() {
      n++;
      if (n == ITERATIONS) deferred.resolve();
    });
    c.setTimeout(id, 1);
  }
}, { defer: true })
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('error', function(event) {
  console.log(event.target.error);
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run();
