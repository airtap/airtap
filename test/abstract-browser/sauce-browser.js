'use strict'

const test = require('tape')
const SauceBrowser = require('../../lib/sauce-browser')
const abstractSuite = require('./abstract-browser')

// Wrap the constructor because it has custom required options.
function factory () {
  return new SauceBrowser({}, {
    browserName: 'chrome',
    version: '60.0',
    platform: 'linux'
  })
}

abstractSuite('SauceBrowser', test, factory)

test('SauceBrowser toString', function (t) {
  t.is(factory().toString(), 'sauce:chrome:60.0:linux')
  t.end()
})
