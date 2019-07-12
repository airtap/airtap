var test = require('tape')
var path = require('path')
var os = require('os')
var fs = require('fs')
var yaml = require('yamljs')
var sauceBrowsers = require('sauce-browsers/callback')
var Airtap = require('../../')
var browsersToTest = require('airtap-browsers').pullRequest
var verify = require('./verify-common')

test('tape - sauce', function (t) {
  var auth = getAuth()

  if (!process.env.CI && !auth.username && !auth.key) {
    t.skip('no sauce labs credentials provided')
    return t.end()
  } else if (!auth.username || !auth.key) {
    t.fail('incomplete sauce labs credentials provided')
    return t.end()
  }

  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')],
    username: auth.username,
    key: auth.key,
    concurrency: 5,
    loopback: 'airtap.local'
  }

  var airtap = Airtap(config)

  sauceBrowsers(browsersToTest, function (err, browsers) {
    if (err) {
      t.fail(err.message)
      return t.end()
    }

    browsers.forEach(function (info) {
      airtap.browser({
        browser: info.api_name,
        version: info.short_version,
        platform: info.os
      })
    })
    verify(t, airtap)
  })
})

function getAuth () {
  // optional additional config from $HOME/.airtaprc
  var config = path.join(os.homedir(), '.airtaprc')
  var rc = {}

  if (fs.existsSync(config)) {
    rc = yaml.parse(fs.readFileSync(config, 'utf-8'))
  }

  return {
    username: process.env.SAUCE_USERNAME || rc.sauce_username,
    key: process.env.SAUCE_ACCESS_KEY || rc.sauce_key
  }
}
