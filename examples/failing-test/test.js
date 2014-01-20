var assert = require('assert');

test('this test passes cause 1 is truthy', function () {
  assert.ok(1, 'one is ok');
});

test('this test fails cause 0 is falsy', function () {
  assert.ok(0, 'zero is ok');
});
