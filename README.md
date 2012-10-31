node-candle
===========

A node.js module for weak referenced callbacks with timeouts. 

![](https://github.com/AlexeyKupershtokh/node-candle/raw/master/assets/candle.png)

A simple example
================

```javascript
var candle = require('candle').candle;

var c = new candle(), id;

id = c.add(function(err, result) { console.log('cb1', err, result); }, 100);
// this will fire at 50ms and output "cb1 null result1.1"
setTimeout(c.resolve.bind(c, id, null, 'result1.1'), 50);
// will fire at 60ms but will not activate the callback since it will have been fred by this time.
setTimeout(c.resolve.bind(c, id, null, 'result1.2'), 60); 

id = c.add(function(err, result) { console.log('cb2', err, result); }, 100);
// this will fire at 150ms, but the callback will have been activated by timeout and output "cb2 timeout undefined"
setTimeout(c.resolve.bind(c, id, null, 'result2'), 150);

// This will fire by timeout and will output "cb3 timeout undefined"
id = c.add(function(err, result) { console.log('cb3', err, result); }, 100);
```

A network example
=================

The main point of this project comparing to the <a href="https://github.com/coolaj86/futures/tree/v2.0/future">future</a> and <a href="https://github.com/temsa/addTimeout">addTimeout</a> is that the candle is more suitable for network applications.
Consider the following use case:

Server2 is known that it has unpredictable response time:
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
Server1 want to send some requests to the Server2 and wait for at most 100ms.
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
socket.emit('myrequest', 'r1', c.add(doSmthWithRequest, 100));
socket.emit('myrequest', 'r2', c.add(doSmthWithRequest, 100));
socket.emit('myrequest', 'r3', c.add(doSmthWithRequest, 100));
```
This code will likely output the following:
```
got null r1_response on 13 th ms
got timeout undefined on 102 th ms
got timeout undefined on 102 th ms
```
Also candle destroys (unreferences) all callback after they have been resolved or timed out to free memory and avoid leaks.
As far as the r2_response will be returned after timeout it will be completely ignored.
