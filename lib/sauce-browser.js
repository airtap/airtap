'use strict'

const wd = require('wd')
const inherits = require('util').inherits
const FirefoxProfile = require('firefox-profile')
const AbstractBrowser = require('./abstract-browser')
const recoverable = require('./recoverable')
const pingInterval = 30e3

function SauceBrowser (config, sauceOptions) {
  if (!(this instanceof SauceBrowser)) {
    return new SauceBrowser(config, sauceOptions)
  }

  this._sauceOptions = sauceOptions
  this._webdriver = null
  this._pingTimer = null

  AbstractBrowser.call(this, config, {
    loopback: true,
    sauceConnect: true
  })
}

inherits(SauceBrowser, AbstractBrowser)

SauceBrowser.prototype.toString = function () {
  const o = this._sauceOptions
  return `sauce:${o.browserName}:${o.version}:${o.platform}`
}

SauceBrowser.prototype._start = function (url, cb) {
  this.debug('sauce config: %O', this._sauceOptions)

  const sauceOptions = this._sauceOptions
  const webdriver = wd.remote(
    'ondemand.saucelabs.com', 80,
    this.config.sauce_username,
    this.config.sauce_key
  )

  const initOpts = Object.assign({
    build: process.env.TRAVIS_BUILD_NUMBER,
    name: this.config.name,
    browserName: sauceOptions.browserName,
    version: sauceOptions.version,
    platform: sauceOptions.platform
  }, this.config.capabilities)

  // Workaround for https://github.com/airtap/browsers/issues/3
  if (initOpts.browserName === 'android' && parseInt(initOpts.version) >= 7) {
    initOpts.deviceName = 'Android GoogleAPI Emulator'
  }

  // use the SAUCE_APPIUM_VERSION environment variable to specify the
  // Appium version. If not specified the test will run against the
  // default Appium version
  if (process.env.SAUCE_APPIUM_VERSION) {
    initOpts['appium-version'] = process.env.SAUCE_APPIUM_VERSION
  }

  // Configure Sauce Connect with a tunnel identifier
  const tunnelId = this.config.tunnel_id
  if (tunnelId) initOpts['tunnel-identifier'] = tunnelId

  if (sauceOptions.firefox_profile) {
    const fp = new FirefoxProfile()
    const extensions = sauceOptions.firefox_profile.extensions

    for (const preference in sauceOptions.firefox_profile) {
      if (preference !== 'extensions') {
        fp.setPreference(preference, sauceOptions.firefox_profile[preference])
      }
    }

    fp.addExtensions(extensions || [], function () {
      fp.encoded(function (zippedProfile) {
        initOpts.firefox_profile = zippedProfile
        this._initWebdriver(webdriver, initOpts, url, cb)
      })
    })
  } else {
    this._initWebdriver(webdriver, initOpts, url, cb)
  }
}

SauceBrowser.prototype._initWebdriver = function (webdriver, initOpts, url, cb) {
  this.debug('init webdriver')

  webdriver.init(initOpts, (err, sessionId, capabilities) => {
    if (err) {
      if (err.data) {
        err.message += ': ' + err.data.split('\n').slice(0, 1)
      }

      return cb(recoverable(err))
    }

    this._webdriver = webdriver
    this.debug('webdriver session: %s', sessionId)
    this.debug('actual capabilities: %O', capabilities)

    this._webdriver.get(url, (err) => {
      if (err) return cb(recoverable(err))
      this._pingpong()
      cb()
    })
  })
}

// Periodically send a dummy command to prevent timing out and to
// catch Sauce Labs operational issues as well as user cancelation.
SauceBrowser.prototype._pingpong = function () {
  this._pingTimer = setInterval(() => {
    // this.debug('ping')
    this._webdriver.url((err) => {
      if (this._pingTimer === null) return
      if (err) return this.stop(cleanError(err))
      // this.debug('pong')
    })
  }, pingInterval)
}

SauceBrowser.prototype._stop = function (cb) {
  clearInterval(this._pingTimer)
  this._pingTimer = null

  if (this._webdriver) {
    let called = false

    this._webdriver.sauceJobStatus(this.stats.ok, (err) => {
      if (called) return
      called = true

      if (err) {
        this.debug('setting Sauce Labs job status failed: %s', err.message)
      }

      this.debug('quit webdriver')
      this._webdriver.quit(cb)
      this._webdriver = null
    })
  } else {
    process.nextTick(cb)
  }
}

function cleanError (err) {
  // The `wd` module doesn't parse these error responses, it expects JSON.
  if (/not json response/i.test(err.message) && typeof err.data === 'string') {
    if (/has already finished/i.test(err.data)) {
      return new Error('Sauce Labs test finished prematurely or was canceled by user')
    } else if (/internal server error/i.test(err.data)) {
      // Retry on Sauce Labs operational issues
      return recoverable(new Error(err.data))
    } else if (err.data) {
      return new Error(err.data)
    }
  }

  return err
}

module.exports = SauceBrowser
