var assert = require("assert")
var candle = require('..').candle;

describe('candle', function(){
  describe('#add()', function(){
    it('should return numeric id', function(){
      var c = new candle;
      var id = c.add(function() {});
      assert.ok(id > 0);
    });
    it('should return different ids', function(){
      var c = new candle;
      var id1 = c.add(function() {});
      var id2 = c.add(function() {});
      assert.ok(id1 != id2);
    });
  });
  describe('#resolve()', function(){
    it('should call callback', function(done){
      var c = new candle;
      var id = c.add(function() {
        assert.equal(arguments.length, 0);
        done();
      });
      c.resolve(id);
    });
    it('should pass args into callback', function(done){
      var c = new candle;
      var id = c.add(function(a, b, c) {
        assert.equal(arguments.length, 2);
        assert.equal(a, 8);
        assert.equal(b, 10);
        done();
      });
      c.resolve(id, 8, 10);
    });
    it('should resolve only once', function(){
      var c = new candle;
      var sum = 0;
      var id = c.add(function(x) {
        sum += x;
      });
      c.resolve(id, 7);
      c.resolve(id, 9);
      assert.equal(sum, 7);
    });
  });
  describe('#delete()', function(){
    it('should delete callback', function(){
      var c = new candle;
      var id = c.add(function() {
        assert.fail();
      });
      c.delete(id);
      c.resolve(id);
    });
  });
  describe('#setTimeout()', function(){
    it('should resolve callback', function(done){
      var c = new candle;
      var id = c.add(function(err) {
        assert.equal(err, 'timeout');
        done();
      });
      c.setTimeout(id, 1);
    });
    it('should resolve callback', function(done){
      var c = new candle;
      var n = 0;
      var id = c.add(function(err) {
        assert.equal(err, null);
        n++;
      });
      c.setTimeout(id, 1);
      c.resolve(id);

      setTimeout(function() {
        assert.equal(n, 1);
        done();
      }, 10);
    });
  });
  describe('#clearTimeout()', function(){
    it('should not resolve callback', function(done){
      var c = new candle;
      var id = c.add(function(err, response) {
        assert.equal(err, null);
        assert.equal(response, 7);
        done();
      });
      c.setTimeout(id, 1);
      c.clearTimeout(id);
      setTimeout(function() {
        c.resolve(id, null, 7);
      }, 10);
    });
  });
});