"use strict";

//var timers = require('timers');
var timers = require('./timers.js'); // use optimized version of node's timers.js
var util = require('util');
var debug = require('debug')('candle');

var Timeout = function () {
};

var TimeoutError = function () {
  Error.captureStackTrace(this, TimeoutError);
};
util.inherits(TimeoutError, Error);
TimeoutError.prototype.name = 'TimeoutError';

var Candle = function (candelabrum, id, cb) {
  debug('Candle ctor(..., '+id+', ...)');
  this.candelabrum = candelabrum;
  this.id = id;
  this.cb = cb;
  this.timeout = null;
};
Candle.prototype.resolve = function (err, result) {
  debug('resolve(' + this.id + ', ...)');
  this.candelabrum.remove(this.id);
  this.clearTimeout();
  this.cb.apply(this, arguments);

  return this;
};
Candle.prototype.clearTimeout = function () {
  debug('clearTimeout()');
  if (this.timeout) {
    timers.clearTimeout(this.timeout);
  }
  this.timeout = null;

  return this;
};
Candle.prototype.setTimeout = function (timeout) {
  debug('setTimeout()');
  this.clearTimeout();
  this.timeout = timers.setTimeout(this.getTimeout(), timeout);

  return this;
};
Candle.prototype.getTimeout = function () {
  debug('getTimeout()');
  var self = this;
  return function () {
    return self.onTimeout();
  };
};
Candle.prototype.onTimeout = function () {
  debug('onTimeout()');
  this.resolve(new Timeout());
};
Candle.prototype.getId = function() {
  debug('getId()');
  return this.id;
};

var Candelabrum = function () {
  this.candles = Object.create(null);
  this.id = 0;
  this.timeoutResolver = null;
};
Candelabrum.prototype.add = function (callback) {
  //var id = ++this.id;
  debug('add(...), assigned id = ' + ++this.id);
  return this.candles[this.id] = new Candle(this, this.id, callback);
};
Candelabrum.prototype.get = function (id) {
  return this.candles[id];
};
Candelabrum.prototype.remove = function (id) {
  debug('remove(' + id + ')');
  delete this.candles[id];
};

module.exports = Candelabrum;
module.exports.Candle = Candle;
module.exports.Timeout = Timeout;
module.exports.TimeoutError = TimeoutError;
