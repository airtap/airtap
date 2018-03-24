'use strict'

const test = require('tape')
const ElectronBrowser = require('../../lib/electron-browser')
const abstractSuite = require('./abstract-browser')

abstractSuite('ElectronBrowser', test, ElectronBrowser)

// Not yet implemented.
test.skip('ElectronBrowser toString', function (t) {
  const browser = new ElectronBrowser()
  const version = require('electron/package.json').version

  t.is(browser.toString(), `<Electron ${version}>`)
  t.end()
})
