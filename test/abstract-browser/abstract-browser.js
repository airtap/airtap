'use strict'

const test = require('tape')
const AbstractBrowser = require('../../lib/abstract-browser')

function suite (name, test, factory) {
  test(`${name} has stats`, function (t) {
    const browser = factory()

    t.same(browser.stats, { ok: false, pass: 0, fail: 0 })
    t.end()
  })

  test(`${name} start & stop`, function (t) {
    t.plan(6)

    const browser = factory()
    const fakeUrl = 'http://localhost:1234'

    t.is(browser._status, 'stopped', 'initial status is stopped')

    browser._start = function (url, callback) {
      t.is(url, fakeUrl, 'got url')
      t.is(browser._status, 'started', 'status is started')

      process.nextTick(function () {
        callback()

        process.nextTick(function () {
          browser.stop()
        })
      })
    }

    browser._stop = function (callback) {
      t.is(browser._status, 'stopping', 'status is stopping')
      process.nextTick(callback)
    }

    browser.run(fakeUrl, function (err, stats) {
      t.ifError(err, 'no error')
      t.is(browser._status, 'stopped', 'status is stopped')
    })
  })

  test(`${name} toString`, function (t) {
    const browser = factory()
    const str = browser.toString()

    t.is(typeof str, 'string', 'is a string')
    t.ok(str, 'is not empty')
    t.isNot(str, '[object Object]', 'is not Object.prototype.toString')

    t.end()
  })
}

suite('AbstractBrowser', test, AbstractBrowser)

// Export so that implementations can run the same suite.
module.exports = suite
