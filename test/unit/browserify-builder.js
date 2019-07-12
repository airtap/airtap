var test = require('tape')
var path = require('path')

// test ensures browserify configuration is applied in order
// https://github.com/defunctzombie/zuul/issues/177
// entry file in this test starts off as:
//     console.log('foo')
// if the configuration is applied in order, the result will be:
//     console.log('qux')
// if not, it will likely be
//     console.log('bar')
test('browserify builder', function (t) {
  var builderBrowserify = require('../../lib/builder-browserify')
  var fixturesDir = path.resolve(__dirname, '../fixtures/builder-browserify')

  var config = {
    browserify: [
      { transform: path.join(fixturesDir, 'foo-to-bar-transform') },
      { plugin: path.join(fixturesDir, 'bar-to-baz-plugin') },
      { transform: path.join(fixturesDir, 'baz-to-qux-transform') }
    ]
  }
  var files = [path.join(fixturesDir, 'entry.js')]
  var builder = builderBrowserify(files, config)

  builder(function (_, src) {
    t.notEqual(src.indexOf("console.log('qux')"), -1)
    builder.close()
    t.end()
  })
})
