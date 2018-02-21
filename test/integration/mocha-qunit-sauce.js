var test = require('tape')
var Zuul = require('../../')
var after = require('after')
var auth = require('../auth')
var getBrowsers = require('../../lib/scout_browser')
var flattenBrowser = require('../../lib/flatten_browser')
var browsersToTest = require('airtap-browsers').pullRequest

test('mocha-qunit - sauce', function (t) {
  var config = {
    prj_dir: __dirname + '/../fixtures/mocha-qunit',
    files: [__dirname + '/../fixtures/mocha-qunit/test.js'],
    username: auth.username,
    concurrency: 5,
    key: auth.key,
    sauce_connect: true,
    loopback: 'airtap.local'
  }

  var zuul = Zuul(config)

  getBrowsers(function (err, allBrowsers) {
    var browsers = flattenBrowser(browsersToTest, allBrowsers)
    browsers.forEach(zuul.browser.bind(zuul))

    t.plan(browsers.length * 3 + 3)
    t.error(err, 'no error')

    zuul.on('browser', function (browser) {
      browser.on('init', function () {
        t.pass('init called')
      })

      browser.on('done', function (results) {
        t.is(results.passed, 1, 'one test passed')
        t.is(results.failed, 1, 'one test failed')
      })
    })

    zuul.on('error', function (err) {
      t.fail(err.message)
    })

    zuul.run(function (err, passed) {
      t.error(err, 'no error')
      t.is(passed, false, 'test should not pass')
    })
  })
})
