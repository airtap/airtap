'use strict'

const test = require('tape')
const path = require('path')
const bundler = require('../../lib/bundler')
const fixtures = path.join(__dirname, 'fixtures/bundler')

// test ensures browserify configuration is applied in order
// https://github.com/defunctzombie/zuul/issues/177
// entry file in this test starts off as:
//     console.log('foo')
// if the configuration is applied in order, the result will be:
//     console.log('qux')
// if not, it will likely be
//     console.log('bar')
test('bundler', function (t) {
  const configs = [
    { transform: path.join(fixtures, 'foo-to-bar-transform') },
    { plugin: path.join(fixtures, 'bar-to-baz-plugin') },
    { transform: path.join(fixtures, 'baz-to-qux-transform') }
  ]

  const files = [path.join(fixtures, 'entry.js')]
  const b = bundler(files, '.', configs, false)

  b.bundle(function (err, src) {
    t.ifError(err, 'no bundle error')
    t.notEqual(src.indexOf("console.log('qux')"), -1)
    t.end()
  })
})
