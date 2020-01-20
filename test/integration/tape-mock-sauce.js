'use strict'

var test = require('tape')
var path = require('path')
var Airtap = require('../../')
var SauceBrowser = require('../../lib/sauce-browser')
var verify = require('./verify-common')
var mockMessages = require('./mock-messages')
var MockWebdriver = require('./mock-webdriver')

test('mock sauce with retry', function (t) {
  var config = {
    prj_dir: path.resolve(__dirname, '../fixtures/tape'),
    files: [path.resolve(__dirname, '../fixtures/tape/test.js')],
    sauce_username: 'mock-username',
    sauce_key: 'mock-key',
    concurrency: 5,
    browser_retries: 6,
    loopback: 'localhost'
  }

  var airtap = Airtap(config)
  var retries = 0

  MockWebdriver.attach(function (webdriver) {
    webdriver.get = function (url, callback) {
      if (retries++ === 0) {
        return process.nextTick(callback, new Error('mock failure'))
      }

      process.nextTick(function () {
        callback()

        process.nextTick(function () {
          // Simulate final handshake between client and server, where once TAP
          // completes, server sends a "complete" message to the client, and the
          // client responds with a "complete" message (and optionally coverage).
          sauceBrowser.once('complete', function () {
            sauceBrowser.handleMessage({ type: 'complete', coverage: null })
          })

          for (const msg of mockMessages()) {
            sauceBrowser.handleMessage(msg)
          }
        })
      })
    }
  })

  var sauceBrowser = new SauceBrowser(config, {
    browser: 'mock-browser',
    version: '1.0.0',
    platform: 'mock-platform'
  })

  airtap.add(sauceBrowser)

  verify(t, airtap, { expectedRetries: 1 }, function () {
    MockWebdriver.detach()
  })
})
