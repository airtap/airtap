'use strict'

const debug = require('debug')('airtap')
const parallel = require('run-parallel-limit')
const sauceConnectLauncher = require('sauce-connect-launcher')
const AggregateError = require('aggregate-error')
const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits
const uuid = require('uuid/v4')
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
  let ok = true

  const concurrency = this._concurrency
  const retries = this._config.browser_retries

  debug('testing %d browsers with a concurrency of %d', this._browsers.length, concurrency)

  createControlServer(this._config, (err, controlServer) => {
    if (err) return cb(err)

    this._launchSauceConnect((err, closeSauceConnect) => {
      if (err) return controlServer.close(withError(err, cb))

      const tasks = this._browsers.map(browser => next => {
        createTestServer(browser, controlServer.port, this._config, (err, testServer) => {
          if (err) return next(err)

          browser.run(testServer.url, { retries }, (err, stats) => {
            // TODO (!!): this will not close testServers of other parallel browsers
            if (err) return testServer.close(withError(err, next))
            if (!stats.ok) ok = false
            testServer.close(next)
          })
        })
      })

      const errors = []

      parallel(tasks, concurrency, (err) => {
        if (err) errors.push(err)
        this._stopAllBrowsers((err) => {
          if (err) errors.push(err)
          closeSauceConnect((err) => {
            if (err) errors.push(err)
            controlServer.close((err) => {
              if (err) errors.push(err)
              cb(combineErrors(errors), ok)
            })
          })
        })
      })
    })
  })
}

Airtap.prototype._launchSauceConnect = function (callback) {
  const enabled = this._config.sauceConnect !== false
  const needed = this._browsers.some(b => b.supports.sauceConnect)

  this._config.tunnel_id = null

  if (!enabled || !needed) {
    return process.nextTick(callback, null, process.nextTick)
  }

  // Required if you run concurrent tunnels
  const tunnelIdentifier = 'airtap-' + uuid()

  // TODO (!!): support direct domains
  sauceConnectLauncher({
    username: this._config.sauce_username,
    accessKey: this._config.sauce_key,
    noSslBumpDomains: 'all',
    tunnelIdentifier
  }, (err, sc) => {
    if (err) return callback(err)

    debug('sauce connect tunnel: %s', tunnelIdentifier)

    // TODO (refactor): pass to SauceBrowser
    // Don't use sc.tunnelId (that's another ID, assigned by Sauce Labs)
    this._config.tunnel_id = tunnelIdentifier

    callback(null, sc.close.bind(sc))
  })
}

Airtap.prototype._stopAllBrowsers = function (cb) {
  const tasks = this._browsers.map(browser => next => {
    browser.stop((err) => {
      next(null, err)
    })
  })

  parallel(tasks, 8, (err, errors) => {
    cb(err || combineErrors(errors.filter(Boolean)))
  })
}

function combineErrors (errors) {
  if (errors.length === 0) return null
  if (errors.length === 1) return errors[0]

  return new AggregateError(errors)
}

function withError (err, callback) {
  const errors = [err]

  return function (err) {
    if (err) errors.push(err)
    callback(combineErrors(errors))
  }
}
