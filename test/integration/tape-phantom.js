var test = require('tape')
var Zuul = require('../../')
var after = require('after')
var assert = require('assert')

test('tape - phantom', function (t) {
  var config = {
    prj_dir: __dirname + '/../fixtures/tape',
    phantom: true,
    concurrency: 1,
    files: [__dirname + '/../fixtures/tape/test.js']
  }

  var zuul = Zuul(config)

  zuul.on('browser', function (browser) {
    var consoleOutput = []

    browser.on('start', function (reporter) {
      reporter.on('console', function (msg) {
        consoleOutput.push(msg.args)
      })
    })

    browser.on('done', function (results) {
      var endOfOutput = consoleOutput.slice(-5)

      // check that we did output untill the end of the test suite
      // this is the number of asserts in tape
      t.deepEqual(endOfOutput[0], ['1..9'])
      t.deepEqual(endOfOutput[1], ['# tests 9'])
      t.deepEqual(endOfOutput[2], ['# pass  5'])
      t.deepEqual(endOfOutput[3], ['# fail  4'])
      t.deepEqual(endOfOutput[4], [''])

      // this is the number of passed/failed test() in tape
      t.is(results.passed, 3)
      t.is(results.failed, 3)
    })
  })

  zuul.run(function (err, passed) {
    t.error(err, 'no error')
    t.is(passed, false, 'test should not pass')
    t.end()
  })
})
