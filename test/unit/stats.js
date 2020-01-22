'use strict'

const test = require('tape')
const Stats = require('../../lib/stats')

test('stats', function (t) {
  const s1 = new Stats(false, 0, 0)

  t.is(s1.ok, false)
  t.is(s1.pass, 0)
  t.is(s1.fail, 0)
  t.is(s1.count, 0)

  const s2 = new Stats(true, 0, 1)

  t.is(s2.ok, false)
  t.is(s2.pass, 0)
  t.is(s2.fail, 1)
  t.is(s2.count, 1)

  const s3 = new Stats(true, 1, 0)

  t.is(s3.ok, true)
  t.is(s3.pass, 1)
  t.is(s3.fail, 0)
  t.is(s3.count, 1)

  s3.ok = false
  t.is(s3.ok, false)

  t.end()
})
