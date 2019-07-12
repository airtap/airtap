'use strict'

var test = require('tape')
var path = require('path')
var Airtap = require('../../')
var verify = require('./verify-common')
var mockMessages = require('./mock-messages')
var MockWebdriver = require('./mock-webdriver')

test('mock sauce with retry', function (t) {
  var airtap = Airtap({
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')],
    username: 'mock-username',
    key: 'mock-key',
    concurrency: 5,
    loopback: 'localhost'
  })

  var retries = 0

  MockWebdriver.attach(function (webdriver) {
    if (retries++ === 0) {
      webdriver.get = function (url, callback) {
        process.nextTick(callback, new Error('mock failure'))
      }
    }

    webdriver.eval = function (js, callback) {
      process.nextTick(callback, null, mockMessages())
    }
  })

  airtap.browser({
    browser: 'mock-browser',
    version: '1.0.0',
    platform: 'mock-platform'
  })

  verify(t, airtap, function () {
    MockWebdriver.detach()
  })
})
