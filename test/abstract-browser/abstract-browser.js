'use strict'

const test = require('tape')
const AbstractBrowser = require('../../lib/abstract-browser')

function suite (name, test, factory) {
  // Not yet implemented.
  test.skip(`${name} has stats`, function (t) {
    const browser = factory()

    t.same(browser.stats, { passed: 0, failed: 0 })
    t.end()
  })

  // Not yet implemented.
  test.skip(`${name} start`, function (t) {
    t.plan(1)

    const browser = factory()

    browser._start = function () {
      t.pass('called _start')
    }

    browser.start()
  })

  // Not yet implemented.
  test.skip(`${name} shutdown`, function (t) {
    t.plan(3)

    const browser = factory()

    browser._shutdown = function (callback) {
      t.pass('called _shutdown')
      callback()
    }

    browser.shutdown(function (err) {
      t.ifError(err, 'no shutdown error')
      t.pass('called callback')
    })
  })

  // Not yet implemented (except on SauceBrowser).
  test.skip(`${name} toString`, function (t) {
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
