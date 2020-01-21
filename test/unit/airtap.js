var test = require('tape')
var path = require('path')
var Airtap = require('../../')
var SauceBrowser = require('../../lib/sauce-browser')
var LocalBrowser = require('../../lib/local-browser')

// Note: this test doesn't make much sense anymore, because
// config is the same object as browser.config.
test('capabilities config', function (t) {
  var config = {
    capabilities: {
      'custom-data': {
        public: 'private'
      }
    },
    loopback: 'airtap.local'
  }

  var airtap = Airtap(config)

  airtap.add(new SauceBrowser(config, {
    browser: 'internet explorer',
    version: '11'
  }))

  var browser = airtap._browsers[0]
  t.same(browser.config.capabilities, config.capabilities)
  t.end()
})

test('browsers are deduped', function (t) {
  var config = {}
  var airtap = Airtap(config)

  airtap.add(new SauceBrowser(config, {
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  }))
  airtap.add(new SauceBrowser(config, {
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  }))

  var browsers = airtap._browsers

  t.is(browsers.length, 1, 'should be deduped')
  t.is(browsers[0]._sauceOptions.browser, 'iphone', '.browser correct')
  t.is(browsers[0]._sauceOptions.version, '11.3', '.version correct')
  t.is(browsers[0]._sauceOptions.platform, 'Mac 10.13', '.platform correct')

  t.end()
})

test('loopback is ignored on local browser', function (t) {
  t.plan(2)

  var config = {
    port: 3000,
    loopback: 'airtap.local',
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')]
  }

  var airtap = Airtap(config)
  var local = new LocalBrowser(config)

  local.run = function (url, opts, callback) {
    t.is(url, 'http://localhost:3000/airtap')
    process.nextTick(callback, null, this.stats)
  }

  airtap.add(local)
  airtap.run(function (err) {
    t.ifError(err, 'no error')
  })
})
