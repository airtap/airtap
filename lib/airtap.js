'use strict'

const debug = require('debug')('airtap')
const parallel = require('run-parallel-limit')
const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits
const createControlServer = require('./control-app')
const createTestServer = require('./setup')

module.exports = Airtap

function Airtap (config) {
  if (!(this instanceof Airtap)) {
    return new Airtap(config)
  }

  EventEmitter.call(this)

  // Note: "username" and "key" are old aliases, no longer used.
  // eslint-disable-next-line
  const { sauce_username, sauce_key, username, key, ...safe } = config
  debug('config: %O', safe)

  this._config = config
  this._concurrency = config.concurrency || 5

  // TODO (!!): remove, pass as argument to run() instead
  this._browsers = []
}

inherits(Airtap, EventEmitter)

Airtap.prototype.add = function (browser) {
  if (!this._browsers.some(b => b.toString() === browser.toString())) {
    this._browsers.push(browser)
  }
}

Airtap.prototype[Symbol.iterator] = function () {
  return this._browsers[Symbol.iterator]()
}

Airtap.prototype.run = function (cb) {
  debug('testing %d browsers with a concurrency of %d', this._browsers.length, this._concurrency)

  createControlServer(this._config, (err, controlServer) => {
    if (err) return cb(err)

    let ok = true

    const tasks = this._browsers.map(browser => next => {
      createTestServer(browser, controlServer.port, this._config, (err, testServer) => {
        if (err) return next(err)

        browser.run(testServer.url, { retries: this._config.browser_retries }, (err, stats) => {
          if (err) return testServer.close(() => next(err))
          if (!stats.ok) ok = false
          testServer.close(next)
        })
      })
    })

    parallel(tasks, this._concurrency, (err) => {
      this._stopAllBrowsers((err2) => {
        controlServer.close((err3) => {
          cb(err || err2 || err3, ok)
        })
      })
    })
  })
}

Airtap.prototype._stopAllBrowsers = function (cb) {
  let stopError

  const tasks = this._browsers.map(browser => next => {
    browser.stop((err) => {
      stopError = stopError || err
      next()
    })
  })

  parallel(tasks, 8, () => {
    cb(stopError)
  })
}
