var test = require('tape')
var path = require('path')
var Zuul = require('../../')
var verify = require('./verify-common')

test('tape - electron', function (t) {
  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [ path.resolve(__dirname, '../fixtures/tape/test.js') ],
    electron: true,
    concurrency: 1
  }
  verify(t, Zuul(config))
})
