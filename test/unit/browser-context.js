'use strict'

const test = require('tape')
const Browser = require('abstract-browser')
const BrowserContext = require('../../lib/browser-context')

test('context can be destroyed', function (t) {
  t.plan(13)

  run(function (browser, context, callback) {
    context.destroy(new Error('test'))
    callback()
  }, 'test', true, '5m')

  run(function (browser, context, callback) {
    callback()
    context.destroy(new Error('test'))
  }, 'test', true, '5m')

  run(function (browser, context, callback) {
    context.createSession(function (session) {
      session.on('close', () => t.pass('session closed'))
      session.on('complete', () => t.fail('session should not complete'))
      context.destroy(new Error('test'))
    })
    callback()
  }, 'test', true, '5m')

  run(function (browser, context, callback) {
    context.createSession(function (session) {
      session.on('close', () => t.pass('session closed'))
      session.on('complete', () => t.fail('session should not complete'))
      session.destroy(new Error('test'))
    })
    callback()
  }, 'test', true, '5m')

  run(function (browser, context, callback) {
    callback()
    setImmediate(() => {
      browser.emit('error', new Error('test'))
    })
  }, 'test', true, '5m')

  run(function (browser, context, callback) {
    callback(new Error('test'))
  }, 'test', false, '5m')

  function run (fn, expectedError, expectClose, timeout) {
    class MockBrowser extends Browser {
      _open (callback) {
        fn(browser, context, callback)
      }

      _close (callback) {
        if (expectClose) t.pass('browser closed')
        callback()
      }
    }

    const manifest = { name: 'test' }
    const target = { url: 'http://localhost' }
    const browser = new MockBrowser(manifest, target)

    const context = new BrowserContext(browser, {
      cwd: '.',
      live: false,
      timeout
    })

    context.run(function (err, stats) {
      t.is(err.message, expectedError)
    })
  }
})
