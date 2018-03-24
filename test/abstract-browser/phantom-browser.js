'use strict'

const test = require('tape')
const PhantomBrowser = require('../../lib/phantom-browser')
const abstractSuite = require('./abstract-browser')

abstractSuite('PhantomBrowser', test, PhantomBrowser)

// Not yet implemented.
test.skip('PhantomBrowser toString', function (t) {
  const browser = new PhantomBrowser()
  const version = require('phantomjs-prebuilt').version

  t.is(browser.toString(), `<PhantomJS ${version}>`)
  t.end()
})
