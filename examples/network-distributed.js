// This example emulates cluster environment with 4 servers.
// Server #1 has open 'sockets' to #2, #3, #4 which respond in (60, 90 and 120 ms correspondingly)
// Server #1 has a shard map and a map of opened sockets.
// Then it sends a distributed request according to the shard map. Each server responds with a delay.
// It passes a payload containing its origin server number.
// Since the server1 sets a timeout of 100ms, then no replies from the server4 (where delay is 120ms)
// will be included into results.

// socket imitation compatible with socket.io :)
var EventEmitter = require('events').EventEmitter;

// server2, server3, server4
var sockets = {};
for (var i = 2; i < 5; i++) {
    (function (i) {
        sockets[i] = new EventEmitter;
        sockets[i].on('myrequest', function(id, payload) {
            // send request with delay dependent on server id: 0 for server#0,
            setTimeout(function() {
                sockets[i].emit('myresponse', id, payload + '_response_from_server#' + i);
            }, i * 30);
        });
    })(i);
}

// server1
var Candle = require('..').Candle;
var c = new Candle();
var start = Date.now();
for (var i in sockets) {
    sockets[i].on('myresponse', function(id, response) {
        c.resolve(id, null, response);
    });
}
// shard map
var shard_map = {
    r1: 2,
    r2: 3,
    r3: 4,
    r4: 2,
    r5: 4
};
// collector is an utility for collecting responses. Since it has collected the target number of collectibles, it
// calls the handler function passing the collection to it.
function collector (n, handle) {
    var collected = [];
    if (n == 0) handle(collected);
    return function (err, response) {
        collected.push(response);
        if (collected.length == n) {
            handle(collected);
        }
    }
}
function distributed_request (requests, handle) {
  // create a collector
  var collect = collector(requests.length, handle);
  for (var i in requests) {
    // register a callback
    var id = c.add(collect);
    // set a timeout to it
    c.setTimeout(id, 100);
    // map key -> shard -> socket
    var socket = sockets[shard_map[requests[i]]];
    // send a request
    socket.emit('myrequest', id, requests[i]);
  }
}
function handle_responses (responses) {
  console.log('got', responses, 'on', (Date.now() - start) + 'th ms');
}
distributed_request(['r1', 'r2', 'r3', 'r4', 'r5'], handle_responses);
distributed_request(['r1', 'r2'], handle_responses);