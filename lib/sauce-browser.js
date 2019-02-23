var wd = require('wd')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var FirefoxProfile = require('firefox-profile')
var debug = require('debug')
var omit = require('lodash').omit
var createTestServer = require('./setup')
var AbstractBrowser = require('./abstract-browser')

function SauceBrowser (conf, opt) {
  if (!(this instanceof SauceBrowser)) {
    return new SauceBrowser(conf, opt)
  }

  AbstractBrowser.call(this)

  this._conf = conf
  // TODO refactor this into AbstractBrowser?
  this._opt = opt
  this.debug = debug('airtap:sauce:' + conf.browser + ':' + conf.version)
  this.debug('browser conf: %j', omit(conf, ['username', 'key']))
}

inherits(SauceBrowser, AbstractBrowser)

SauceBrowser.prototype.toString = function () {
  var self = this
  var conf = self._conf
  return '<' + conf.browser + ' ' + conf.version + ' on ' + conf.platform + '>'
}

SauceBrowser.prototype._start = function () {
  var self = this
  var conf = self._conf

  self.stopped = false

  self.debug('running')
  var webdriver = self.webdriver = wd.remote('ondemand.saucelabs.com', 80, conf.username, conf.key)

  self.controller = createTestServer(self._opt, function (err, url) {
    if (err) {
      return self.shutdown(err)
    }

    self.emit('init', conf)

    var initOpts = Object.assign({
      build: conf.build,
      name: conf.name,
      browserName: conf.browser,
      version: conf.version,
      platform: conf.platform
    }, conf.capabilities)

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
    var tunnelId = self._opt.tunnel_id || process.env.TRAVIS_JOB_NUMBER
    if (tunnelId) {
      initOpts['tunnel-identifier'] = tunnelId
    }

    if (conf.firefox_profile) {
      var fp = new FirefoxProfile()
      var extensions = conf.firefox_profile.extensions
      for (var preference in conf.firefox_profile) {
        if (preference !== 'extensions') {
          fp.setPreference(preference, conf.firefox_profile[preference])
        }
      }
      extensions = extensions || []
      fp.addExtensions(extensions, function () {
        fp.encoded(function (zippedProfile) {
          initOpts.firefox_profile = zippedProfile
          init()
        })
      })
    } else {
      init()
    }

    function init () {
      self.debug('queuing')

      webdriver.init(initOpts, function (err) {
        if (err) {
          if (err.data) {
            err.message += ': ' + err.data.split('\n').slice(0, 1)
          }
          return self.shutdown(err)
        }

        var reporter = new EventEmitter()

        reporter.on('test_end', function (test) {
          if (!test.passed) {
            return self.stats.failed++
          }
          self.stats.passed++
        })

        reporter.on('done', function (results) {
          clearTimeout(self.noOutputTimeout)
          self.debug('done')
          var passed = results.passed
          var called = false
          webdriver.sauceJobStatus(passed, function (err) {
            if (called) {
              return
            }

            called = true
            self.shutdown()

            if (err) {
              self.debug('Setting Sauce Labs job status failed %s', err.message)
            }
          })

          reporter.removeAllListeners()
        })

        self.debug('open %s', url)
        self.emit('start', reporter)

        var timeout = false
        var timer = setTimeout(function () {
          self.debug('timed out waiting for open %s', url)
          timeout = true
          self.shutdown(new Error('Timeout opening url after ' + Math.round(self._opt.browser_open_timeout / 1000) + 's'))
        }, self._opt.browser_open_timeout)

        webdriver.get(url, function (err) {
          self.debug('browser opened url')

          if (timeout) {
            return
          }

          clearTimeout(timer)

          if (err) {
            return self.shutdown(err)
          }

          // no new output for 30s => error
          watchOutput()

          function watchOutput () {
            if (self._opt.browser_output_timeout === -1) {
              return
            }

            clearTimeout(self.noOutputTimeout)

            self.noOutputTimeout = setTimeout(function () {
              self.shutdown(new Error('Did not receive any new output from browser for ' + Math.round(self._opt.browser_output_timeout / 1000) + 's, shutting down'))
            }, self._opt.browser_output_timeout)
          }

          function wait () {
            if (self.stopped) {
              return
            }

            self.debug('waiting for test results from %s', url)
            // take the last 1000 log lines
            // careful, the less you log lines, the slower your test
            // result will be. The test could be finished in the browser
            // but not in your console since it can take a lot
            // of time to get a lot of results
            var js = '(window.zuul_msg_bus ? window.zuul_msg_bus.splice(0, 1000) : []);'
            webdriver.eval(js, function (err, res) {
              if (err) {
                self.debug('err: %s', err.message)
                return self.shutdown(err)
              }

              res = res || []
              // When testing with microsoft edge:
              // Adds length property to array-like object if not defined to execute filter properly
              if (res.length === undefined) {
                res.length = Object.keys(res).length
              }
              self.debug('res.length: %s', res.length)

              // if we received some data, reset the no output watch timeout
              if (res.length > 0) {
                watchOutput()
              }

              var isDone = false
              Array.prototype.filter.call(res, Boolean).forEach(function (msg) {
                if (msg.type === 'done') {
                  isDone = true
                }

                reporter.emit(msg.type, msg)
              })

              if (isDone) {
                self.debug('finished tests for %s', url)
                return
              }

              self.debug('fetching more results')

              // if we found results, let's not wait
              // to get more
              if (res.length > 0) {
                process.nextTick(wait)
              } else {
                // otherwise, let's wait a little so that we do not
                // spam saucelabs
                setTimeout(wait, 2000)
              }
            })
          }

          wait()
        })
      })
    }
  })
}

SauceBrowser.prototype.shutdown = function (err) {
  var self = this

  clearTimeout(self.noOutputTimeout)

  self.stopped = true

  var doShutdown = function (_err) {
    self.debug('shutdown')

    if (self.controller) {
      self.controller.shutdown()
    }

    var error = err || _err
    if (error) {
      // prefix browser err message with browser version
      error.message = self._conf.browser + '@' + self._conf.version + ': ' + error.message
      return self.emit('error', error)
    }

    self.emit('done', self.stats)
    self.removeAllListeners()
  }

  // make sure the browser shuts down before continuing
  if (self.webdriver) {
    self.debug('quitting browser')

    var timeout = false
    var timer = setTimeout(function () {
      self.debug('timed out waiting for browser to quit')
      timeout = true
      doShutdown()
    }, 10 * 1000)

    self.webdriver.quit(function (err) {
      if (timeout) {
        return
      }

      clearTimeout(timer)
      doShutdown(err)
    })
  } else {
    doShutdown()
  }
}

module.exports = SauceBrowser
