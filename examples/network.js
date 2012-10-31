// socket imitation compatible with socket.io :)
var socket = new (require('events').EventEmitter);

// server2
socket.on('myrequest', function(payload, id) {
  // dont send anything at all about 'r3'
  if (payload == 'r3') return;

  // send response after 10ms for 'r1', but after 1000ms for 'r2'.
  var timeout = (payload == 'r1') ? 10 : 1000;
  setTimeout(function() {
    socket.emit('myresponse', id, payload + '_response');
  }, timeout);
});

// server1
var candle = require('..').candle;
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
