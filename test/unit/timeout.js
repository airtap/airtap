'use strict'

const test = require('tape')
const timeout = require('../../lib/timeout')

test('timeout', function (t) {
  t.plan(5)

  t.notOk(timeout.optional(function () {
    t.fail('should not be called')
  }, 0))

  t.notOk(timeout.optional(function () {
    t.fail('should not be called')
  }, -1))

  t.notOk(timeout.optional(function () {
    t.fail('should not be called')
  }, Infinity))

  t.ok(timeout.optional(function () {
    t.pass()
  }, 1))
})

test('timeout error', function (t) {
  const err = new timeout.Error('foo', 200)

  t.is(err.message, 'foo (0.2 seconds)')
  t.is(err.name, 'TimeoutError')
  t.is(err.expected, true)
  t.end()
})
