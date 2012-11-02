node-candle
===========

node-candle is a node.js module that brings a callback broker to your application. It's inspired by socket.io <a href="https://github.com/learnboost/socket.io/#getting-acknowledgements">acknowledgements</a>.
 * it assigns ids to callbacks. This allows to create request-response mechanism over any network module easily.
 * it can add timeouts to callbacks.
 * it makes callbacks weakly referenced. And after a callback is resolved or timed out it becomes free and is destroyed during next garbage collection. This feature aims to let you create leak-free applications. This feature is the contrary to <a href="https://github.com/temsa/addTimeout">addTimeout</a> and <a href="https://github.com/coolaj86/futures/tree/v2.0/future">future</a> and which can keep callbacks from deletion.
 * it's <a href="https://github.com/AlexeyKupershtokh/node-candle/tree/master/benchmark">blazing fast</a> and can do 300K add+settimeout+resolve iterations per second.

![](https://github.com/AlexeyKupershtokh/node-candle/raw/master/assets/candle.png)

A simple example
================

```javascript
var candle = require('candle').candle;

// Create a new candle, usually you will need only one since it can handle many callbacks.
var c = new candle();

// Add a callback to it
var id = c.add(function(err, response) { console.log('callback fired,', response); })

// You can pass these ids over network and catch back along it with a response.
// When you're ready just resolve the callback using these ids:
c.resolve(id, null, 'whoa!');

// output: "callback fired, whoa!"
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
var candle = require('candle').candle;

var c = new candle();

var start = Date.now();
socket.on('myresponse', function(id, response) {
  c.resolve(id, null, response);
});
var doSmthWithRequest = function(err, request) {
  console.log('got', err, request, 'on', Date.now() - start, 'th ms');
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
got null r1_response on 13 th ms
got timeout undefined on 102 th ms
got timeout undefined on 102 th ms
```
So we get the response and 2 timeouts right after 100ms passed.
As far as the r2_response will be returned after timeout it will be completely ignored.
