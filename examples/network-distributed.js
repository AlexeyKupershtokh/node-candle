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
function distributed_request (requests, gather) {
  var responses = [];
  for (var i in requests) {
    var id = c.add(function(err, response) {
      responses.push(response);
      if (responses.length == requests.length) {
        gather(responses);
      }
    });
    c.setTimeout(id, 100);
    socket.emit('myrequest', id, requests[i]);
  }
}
function handle_responses (responses) {
  console.log('got', responses, 'on', (Date.now() - start) + 'th ms');
}
distributed_request(['r1', 'r2', 'r3'], handle_responses);