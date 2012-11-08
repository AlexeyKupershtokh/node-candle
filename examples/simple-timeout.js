var Candle = require('..');

// Create a new candle, usually you will need only one since it can handle many callbacks.
var c = new Candle();

// Add a callback to it
var id = c.add(function(err, response) { console.log('callback fired,', !!err, response); })

c.setTimeout(id, 1000);

// output after 1 second: callback fired, timeout undefined