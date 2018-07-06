var debug = require('debug')('airtap')
var omit = require('lodash').omit
var Batch = require('batch')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var createControlServer = require('./control-app')
var createTestServer = require('./setup')
var SauceBrowser = require('./sauce-browser')
var ElectronBrowser = require('./electron-browser')

module.exports = Airtap

function Airtap (config) {
  if (!(this instanceof Airtap)) {
    return new Airtap(config)
  }

  EventEmitter.call(this)

  if (config.browser_retries === undefined) {
    config.browser_retries = 6
  }

  if (config.browser_output_timeout === undefined) {
    config.browser_output_timeout = -1
  }

  if (config.browser_open_timeout === undefined) {
    config.browser_open_timeout = 120 * 1000
  }

  this._config = config

  debug('config: %j', omit(config, ['sauce_username', 'sauce_key', 'username', 'key']))

  // list of browsers to test
  this._browsers = []
  this._concurrency = config.concurrency || 5
}

inherits(Airtap, EventEmitter)

Airtap.prototype.browser = function (info) {
  if (!this._browsers.some(compare(info))) {
    var config = this._config
    this._browsers.push(SauceBrowser({
      name: config.name,
      build: process.env.TRAVIS_BUILD_NUMBER,
      firefox_profile: info.firefox_profile,
      username: config.username,
      key: config.key,
      browser: info.browser,
      version: info.version,
      platform: info.platform,
      capabilities: config.capabilities
    }, config))
  }
}

Airtap.prototype.run = function (cb) {
  var self = this
  var config = self._config

  createControlServer(config, function (err, server) {
    if (err) return cb(err)

    debug('control server active on port %d', server.port)
    config.control_port = server.port

    function exit (err, result) {
      server.close(function (err2) {
        cb(err || err2, result)
      })
    }

    if (config.local) {
      var testServer = createTestServer(config, function (err, url) {
        if (err) return cb(err)

        cb(null, url, function close (cb) {
          server.close(function (err) {
            testServer.shutdown(function (err2) {
              cb(err || err2)
            })
          })
        })
      })
      return
    }

    if (config.electron) {
      var electron = ElectronBrowser(config)
      self.emit('browser', electron)
      electron.once('done', function (stats) {
        exit(null, stats.failed === 0 && stats.passed > 0)
      })
      return electron.start()
    }

    var batch = new Batch()
    batch.concurrency(self._concurrency)

    var passed = true

    debug(`begin testing ${self._browsers.length} different browsers`)

    self._browsers.forEach(function (browser) {
      self.emit('browser', browser)

      var retries = config.browser_retries

      browser.on('error', function (err) {
        if (--retries >= 0) {
          debug('browser error (%s), restarting', err.message)
          self.emit('restart', browser)
          return browser.start()
        }

        self.emit('error', err)
      })

      batch.push(function (done) {
        browser.once('done', function (stats) {
          // if no tests passed, then this is also a problem
          // indicates potential error to even run tests
          if (stats.failed || stats.passed === 0) {
            passed = false
          }
          done()
        })
        browser.start()
      })
    })

    batch.end(function (err) {
      debug('batch done')
      exit(err, passed)
    })
  })
}

function compare (info) {
  return function (sauceBrowser) {
    var conf = sauceBrowser._conf
    return (conf.browser === info.browser &&
            conf.version === info.version &&
            conf.platform === info.platform)
  }
}
