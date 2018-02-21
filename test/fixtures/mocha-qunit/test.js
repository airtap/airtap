var test = require('tape')
var assert = require('assert')

test('test 1', function (t) {
  t.ok(true)
  t.end()
})

test('test 2', function (t) {
  t.ok(false)
  t.end()
})
