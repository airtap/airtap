var test = require('tape')
var path = require('path')
var Airtap = require('../../')
var verify = require('./verify-common')

test('tape - electron', function (t) {
  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')],
    electron: true,
    // Should be ignored. TODO: add separate test for this.
    loopback: 'airtap.local',
    concurrency: 1
  }
  verify(t, Airtap(config))
})
