node-candle
===========
[![Build Status](https://travis-ci.org/AlexeyKupershtokh/node-candle.png)](https://travis-ci.org/AlexeyKupershtokh/node-candle)

node-candle is a node.js module that brings a callback broker to your application. It's inspired by socket.io <a href="https://github.com/learnboost/socket.io/#getting-acknowledgements">acknowledgements</a>.
 * it assigns ids to callbacks. This allows to create request-response mechanism over any network module easily.
 * it can add timeouts to callbacks.
 * it makes callbacks weakly referenced. And after a callback is resolved or timed out it becomes free and is destroyed during next garbage collection. This feature aims to let you create leak-free applications. This feature is the contrary to <a href="https://github.com/temsa/addTimeout">addTimeout</a> and <a href="https://github.com/coolaj86/futures/tree/v2.0/future">future</a> which can keep callbacks from deletion.
 * it's <a href="https://github.com/AlexeyKupershtokh/node-candle/tree/master/benchmark">blazing fast</a> and can do:
  * 1,000,000 `add()`+`resolve()` iterations per second;
  * 500,000 `add()`+`setTimeout()`+`resolve()` iterations per second.

![](https://github.com/AlexeyKupershtokh/node-candle/raw/master/assets/candle.png)

A simple example
================

```javascript
var Candle = require('candle');

// Create a new candle, usually you will need only one since it can handle many callbacks.
var c = new Candle();

// Add a callback to it
var id = c.add(function(err, response) { console.log('callback fired,', !!err, response); })

// You can pass these ids over network and catch back along it with a response.
// When you're ready just resolve the callback using these ids:
c.resolve(id, null, 'whoa!');

// output: "callback fired, false whoa!"
```
<a href="https://github.com/AlexeyKupershtokh/node-candle/tree/master/examples">More examples</a>. Also consider `DEBUG=candle node script.js` to better understand how it works.

A network example
=================

Let's examine the following situation. We have 2 servers, Server1 and Server2, and we want to make some requests from Server1 to Server2 which is known that it has unpredictable response time:
```javascript
socket.on('myrequest', function(payload, id) {
  // dont send anything at all about 'r3'
  if (payload == 'r3') return;

  // send response after 10ms for 'r1', but after 1000ms for 'r2'.
  var timeout = (payload == 'r1') ? 10 : 1000;
  setTimeout(function() {
    socket.emit('myresponse', id, payload + '_response');
  }, timeout);
});
```
So we would like to send the requests to the Server2 and wait for responses for at most 100ms.
```javascript
var Candle = require('candle');

var c = new Candle();

var start = Date.now();
socket.on('myresponse', function(id, response) {
  c.resolve(id, null, response);
});
var doSmthWithRequest = function(err, request) {
  console.log('got', !!err, request, 'on', Date.now() - start, 'th ms');
};
var id;
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', 'r1', id);
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', 'r2', id);
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', 'r3', id);
```
This code will likely output the following:
```
got false r1_response on 13 th ms
got true undefined on 102 th ms
got true undefined on 102 th ms
```
So we get the response and 2 timeouts right after 100ms passed.
As far as the r2_response will be returned after timeout it will be completely ignored.

Installation
============
`npm install candle`

Usage
=====

* `c = new Candle` - create a new candle
* `id = c.add(callback)` - add a callback to the candle. Assigned id is returned.
* `c.resolve(id, [args, ...])` - resolve a callback identified by id and pass custom args to it.
* `c.remove(id)` - completely remove the callback.
* `c.setTimeout(id, timeout)` - add a timeout `timeout` ms to a callback by id.
* `c.clearTimeout(id)` - remove a timeout from a callback by id.
* `c.setTimeoutResolver(callback)` - assign a custom candle-wide callback that will be used to resolve on timeout. Default behavior is `function(id) { this.resolve(id, new Timeout()); }`. Sometimes, e.g. when you use the candle with <a href="https://github.com/caolan/async#parallel">async.parallel</a>, you may want to use something like this callback: `function(id) { this.resolve(id, null, { status: 'timeout' }); }` to avoid it look like an error.

Running tests
==========================
`npm test`

NB: don't forget to run `npm install` from the candle module directory or install it with `npm install candle --dev` to install test framework

Running benchmarks
==========================
`node benchmark/...`

NB: don't forget to run `npm install` from the candle module directory or install it with `npm install candle --dev` to install benchmark framework