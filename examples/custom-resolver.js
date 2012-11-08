var Candle = require('..');

// Create a new candle, usually you will need only one since it can handle many callbacks.
var c = new Candle();

// Usually on timeout it calls callback with an arguments 'error'.
// But we set a custom timeout resolver in this case.
// This can be useful for integrating with the async module.
c.setTimeoutResolver(function(id) { this.resolve(id, null, { timeout: true }); })

// Add a callback to it
var id = c.add(function(err, response) { console.log('callback fired,', err, response); })

c.setTimeout(id, 1000);

// output after 1 second: callback fired, null, { timeout: true }