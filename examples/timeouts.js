var Candle = require('..');

var c = new Candle(), id;

id = c.add(function(err, result) { console.log('cb1', !!err, result); });
c.setTimeout(id, 100);
setTimeout(c.resolve.bind(c, id, null, 'result1.1'), 50);
setTimeout(c.resolve.bind(c, id, null, 'result1.2'), 60);

id = c.add(function(err, result) { console.log('cb2', !!err, result); });
c.setTimeout(id, 100);
setTimeout(c.resolve.bind(c, id, null, 'result2'), 150);

id = c.add(function(err, result) { console.log('cb3', !!err, result); });
c.setTimeout(id, 100);
