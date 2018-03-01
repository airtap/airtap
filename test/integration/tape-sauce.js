var test = require('tape')
var path = require('path')
var sauceBrowsers = require('sauce-browsers/callback')
var Zuul = require('../../')
var auth = require('../auth')
var browsersToTest = require('airtap-browsers').pullRequest
var verify = require('./verify-common')

test('tape - sauce', function (t) {
  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [ path.resolve(__dirname, '../fixtures/tape/test.js') ],
    username: auth.username,
    concurrency: 5,
    key: auth.key,
    sauce_connect: true,
    loopback: 'airtap.local'
  }

  var zuul = Zuul(config)

  sauceBrowsers(browsersToTest, function (err, browsers) {
    if (err) {
      t.fail(err.message)
      return t.end()
    }

    browsers.forEach(function (info) {
      zuul.browser({
        name: info.api_name,
        version: info.short_version,
        platform: info.os
      })
    })
    verify(t, zuul)
  })
})
