var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite;
Candle = require('..');
cb = require('cb');
Future = require('future');
addTimeout = require('addTimeout');

//function noop() {};
noop = function() {};
var setup = function() { var c = new Candle; };
var teardown = function() { console.log(c.id, Object.keys(c.callbacks).length); };
var options = {
  setup: setup,
  //teardown: teardown,
  //onComplete: function () { console.log(this.compiled.toString()); }
};

var ITERATIONS = 1000;
var context = {};

suite
.add('warmup', function() {
  var d = Date.now();
})
.add('candle: 1000*add + 1000*resolve', function() {
  var a = [], c = new Candle, i;
  for (i = 0; i < 1000; i++) {
    a.push(c.add(noop))
  }
  for (i = 0; i < 1000; i++) {
    c.resolve(a[i]);
  }
})
.add('cb:     1000*add + 1000*resolve', function() {
  var a = [], i;
  for (i = 0; i < 1000; i++) {
    a.push(cb(noop).once());
  }
  for (i = 0; i < 1000; i++) {
    a[i]();
  }
})
.add('future: 1000*add + 1000*resolve', function() {
  var a = [], i;
  for (i = 0; i < 1000; i++) {
    a.push(Future({}).when(noop));
  }
  for (i = 0; i < 1000; i++) {
    a[i].fulfill();
  }
})
.add('candle: 1000*add + 1000*setTimeout + 1000*resolve', function() {
  var a = [], c = new Candle, i;
  for (i = 0; i < 1000; i++) {
    a.push(c.add(noop))
  }
  for (i = 0; i < 1000; i++) {
    c.setTimeout(a[i], 1);
  }
  for (i = 0; i < 1000; i++) {
    c.resolve(a[i]);
  }
})
.add('cb:     1000*add + 1000*setTimeout + 1000*resolve', function() {
  var a = [], i;
  for (i = 0; i < 1000; i++) {
    a.push(cb(noop).once());
  }
  for (i = 0; i < 1000; i++) {
    a[i].timeout(1);
  }
  for (i = 0; i < 1000; i++) {
    a[i]();
  }
})
.add('future: 1000*add + 1000*setTimeout + 1000*resolve', function() {
  var a = [], i;
  for (i = 0; i < 1000; i++) {
    a.push(Future({}).when(noop));
  }
  for (i = 0; i < 1000; i++) {
    a[i].setTimeout(1);
  }
  for (i = 0; i < 1000; i++) {
    a[i].setTimeout(0);
  }
  for (i = 0; i < 1000; i++) {
    a[i].fulfill();
  }
})
.add('candle: 1000*(add + setTimeout) + 1000*timeout', function(deferred) {
  var c = new Candle, n = 0, i, em;
  for (i = 0; i < ITERATIONS; i++) {
    em = c.add(function() {
      n++;
      if (n == ITERATIONS) deferred.resolve();
    });
    c.setTimeout(em, 1);
  }
}, { defer: true })
.add('cb:     1000*(add + setTimeout) + 1000*timeout', function(deferred) {
  var n = 0, i, em;
  for (i = 0; i < ITERATIONS; i++) {
    em = cb(function() {
      n++;
      if (n == ITERATIONS) deferred.resolve();
    });
    em.once();
    em.timeout(1);
  }
}, { defer: true })
.add('future: 1000*(add + setTimeout) + 1000*timeout', function(deferred) {
  var n = 0, i, em;
  for (i = 0; i < ITERATIONS; i++) {
    em = Future({}).when(function() {
      n++;
      if (n == ITERATIONS) deferred.resolve();
    });
    em.setTimeout(1);
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
