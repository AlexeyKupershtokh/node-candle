var candle = require('..').candle;

// Create a new candle, usually you will need only one since it can handle many callbacks.
var c = new candle();

// Add a callback to it
var id = c.add(function(err, response) { console.log('callback fired,', response); })

// You can pass these ids over network and catch back along it with a response.
// When you're ready just resolve the callback using these ids:
c.resolve(id, null, 'whoa!');

// output: "callback fired, whoa!"
