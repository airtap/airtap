var test = require('tape')
var Zuul = require('../../')
var after = require('after')
var assert = require('assert')
var verify = require('./verify-common')

test('tape - phantom', function (t) {
  var config = {
    prj_dir: __dirname + '/../fixtures/tape',
    files: [__dirname + '/../fixtures/tape/test.js'],
    phantom: true,
    concurrency: 1
  }
  verify(t, Zuul(config))
})
