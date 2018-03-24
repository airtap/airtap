'use strict'

const test = require('tape')
const SauceBrowser = require('../../lib/sauce-browser')
const abstractSuite = require('./abstract-browser')

// Wrap the constructor because it has custom required options.
function factory () {
  return new SauceBrowser({
    browser: 'chrome',
    version: '60.0',
    platform: 'linux'
  }, {})
}

abstractSuite('SauceBrowser', test, factory)

test('SauceBrowser toString', function (t) {
  // TODO: make it "Sauce Labs chrome 60.0 linux"?
  t.is(factory().toString(), '<chrome 60.0 on linux>')
  t.end()
})
