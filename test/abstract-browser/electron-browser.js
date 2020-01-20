'use strict'

const test = require('tape')
const ElectronBrowser = require('../../lib/electron-browser')
const abstractSuite = require('./abstract-browser')

abstractSuite('ElectronBrowser', test, ElectronBrowser)

test('ElectronBrowser toString', function (t) {
  const browser = new ElectronBrowser()
  const version = require('electron/package.json').version

  t.is(browser.toString(), `electron:${version}`)
  t.end()
})
