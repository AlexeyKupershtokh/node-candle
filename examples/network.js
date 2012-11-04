// socket imitation compatible with socket.io :)
var socket = new (require('events').EventEmitter);

// server2
socket.on('myrequest', function(id, payload) {
  // dont send anything at all about 'r3'
  if (payload == 'r3') return;

  // send response after 10ms for 'r1', but after 1000ms for 'r2'.
  var timeout = (payload == 'r1') ? 10 : 1000;
  setTimeout(function() {
    socket.emit('myresponse', id, payload + '_response');
  }, timeout);
});

// server1
var Candle = require('..').Candle;
var c = new Candle();
var start = Date.now();
socket.on('myresponse', function(id, response) {
  c.resolve(id, null, response);
});
var doSmthWithRequest = function(err, request) {
  console.log('got', err, request, 'on', (Date.now() - start) + 'th ms');
};
var id;
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', id, 'r1');
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', id, 'r2');
id = c.add(doSmthWithRequest);
c.setTimeout(id, 100);
socket.emit('myrequest', id, 'r3');
