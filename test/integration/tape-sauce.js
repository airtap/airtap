var test = require('tape')
var Zuul = require('../../')
var after = require('after')
var auth = require('../auth')
var getBrowsers = require('../../lib/scout_browser')
var flattenBrowser = require('../../lib/flatten_browser')
var browsersToTest = require('airtap-browsers').pullRequest
var verify = require('./verify-common')

test('tape - sauce', function (t) {
  var config = {
    prj_dir: __dirname + '/../fixtures/tape',
    files: [__dirname + '/../fixtures/tape/test.js'],
    username: auth.username,
    concurrency: 5,
    key: auth.key,
    sauce_connect: true,
    loopback: 'airtap.local'
  }

  var zuul = Zuul(config)

  getBrowsers(function (err, allBrowsers) {
    t.error(err, 'no error')
    var browsers = flattenBrowser(browsersToTest, allBrowsers)
    browsers.forEach(zuul.browser.bind(zuul))
    verify(t, zuul)
  })
})
