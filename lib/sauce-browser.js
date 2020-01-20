'use strict'

const wd = require('wd')
const inherits = require('util').inherits
const FirefoxProfile = require('firefox-profile')
const AbstractBrowser = require('./abstract-browser')
const recoverable = require('./recoverable')

function SauceBrowser (config, sauceOptions) {
  if (!(this instanceof SauceBrowser)) {
    return new SauceBrowser(config, sauceOptions)
  }

  this._sauceOptions = sauceOptions
  this._webdriver = null

  AbstractBrowser.call(this, config)
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
  const tunnelId = this.config.tunnel_id || process.env.TRAVIS_JOB_NUMBER
  if (tunnelId) initOpts['tunnel-identifier'] = tunnelId

  // NOTE (!!): Temporary.
  if (this.config.idle_timeout) {
    // The Sauce Labs idleTimeout option is given in seconds
    initOpts.idleTimeout = Math.ceil(this.config.idle_timeout / 1e3)
  }

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

  webdriver.init(initOpts, (err, sessionId) => {
    if (err) {
      if (err.data) {
        err.message += ': ' + err.data.split('\n').slice(0, 1)
      }

      return cb(recoverable(err))
    }

    this._webdriver = webdriver
    this.debug('webdriver session: %s', sessionId)

    this._webdriver.get(url, (err) => {
      if (err) return cb(recoverable(err))
      cb()
    })
  })
}

SauceBrowser.prototype._stop = function (cb) {
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

module.exports = SauceBrowser
