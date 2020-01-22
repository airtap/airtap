'use strict'

const test = require('tape')
const Test = require('../../lib/test')

test('test', function (t) {
  t.plan(17)

  const test = new Test()

  t.is(test.destroyed, false)
  t.is(test.stats.count, 0)
  t.is(test.stats.pass, 0)
  t.is(test.stats.fail, 0)
  t.is(test.stats.ok, true)

  test.aggregate({ ok: true })

  t.is(test.stats.count, 1)
  t.is(test.stats.pass, 1)
  t.is(test.stats.fail, 0)
  t.is(test.stats.ok, true)

  test.aggregate({ ok: false })

  t.is(test.stats.count, 2)
  t.is(test.stats.pass, 1)
  t.is(test.stats.fail, 1)
  t.is(test.stats.ok, false)

  test.on('complete', function (stats) {
    t.ok(stats === test.stats)
    t.is(test.destroyed, false)

    process.nextTick(function () {
      t.is(test.destroyed, true)

      test.on('close', function () {
        t.pass('emitted close in next tick')
      })
    })
  })

  test.complete()
})

test('destroy test', function (t) {
  t.plan(2)

  const test = new Test()

  test.on('complete', function () {
    t.fail('should not be called')
  })

  test.on('error', function (err) {
    t.is(err.message, 'test')

    test.on('close', function () {
      t.pass('closed')
    })
  })

  test.destroy(new Error('test'))
  test.complete()
})
