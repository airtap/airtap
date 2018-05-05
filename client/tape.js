var finished = require('tap-finished')
var parser = require('tap-parser')
var Reporter = require('./reporter')

if (typeof global.console === 'undefined') {
  global.console = {}
}

var reporter = Reporter()
var previousTest
var assertions = 0
var done = false
var noMoreTests = false

var parseStream = parser()

var finishedStream = finished(function () {
  done = true
  parseStream.end()
  reporter.done()
})

var originalLog = global.console.log
global.console.log = function () {
  var msg = arguments[0]

  // do not write in a closed WriteStream
  if (!done) {
    parseStream.write(msg + '\n')
    finishedStream.write(msg + '\n')
  }

  // transfer log to original console,
  // this shows the tap output in console
  // and also let the user add console logs
  if (typeof originalLog === 'function') {
    return originalLog.apply(this, arguments)
  }
}

parseStream.on('comment', function (comment) {
  // if we received 'plan' then no need to go further
  if (noMoreTests) {
    return
  }

  endPreviousTestIfNeeded()

  previousTest = {
    name: comment
  }

  assertions = 0

  reporter.test({
    name: comment
  })
})

parseStream.on('assert', function (assert) {
  if (!assert.ok) {
    assertions++
  }

  reporter.assertion({
    result: assert.ok,
    expected: undefined,
    actual: undefined,
    message: assert.name || 'unnamed assert',
    error: undefined,
    stack: undefined
  })
})

parseStream.on('plan', function (plan) {
  // starting here, we know the full tape suite is finished
  endPreviousTestIfNeeded()
  noMoreTests = true
})

function endPreviousTestIfNeeded () {
  if (previousTest) {
    reporter.test_end({
      passed: assertions === 0,
      name: previousTest.name
    })
  }
}
