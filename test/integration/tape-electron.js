var test = require('tape')
var path = require('path')
var Airtap = require('../../')
var ElectronBrowser = require('../../lib/electron-browser')
var verify = require('./verify-common')

test('tape - electron', function (t) {
  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')],

    // Should be ignored. TODO: add separate test for this.
    loopback: 'airtap.local',
    concurrency: 1
  }

  var airtap = Airtap(config)
  airtap.add(new ElectronBrowser(config))

  verify(t, airtap)
})
