module.exports = function (t, airtap, callback) {
  var count = airtap._browsers.length || 1
  t.plan(count * 8 + 2)

  // TODO (!!): instead pass browsers array to verifyCommon
  airtap.on('browser', function (browser) {
    var consoleOutput = []
    var starts = 0

    browser.on('message', function (msg) {
      if (msg.type === 'console' && msg.level === 'log') {
        consoleOutput.push(msg.args)
      }
    })

    browser.on('starting', function () {
      // If there's a Sauce Labs error, starting will be emitted on each retry.
      starts++
    })

    browser.on('stop', function (err, stats) {
      var endOfOutput = consoleOutput.slice(-5)

      t.is(err, null)
      t.ok(starts > 0, 'browser emitted "starting" ' + starts + ' times')

      // check that we did output untill the end of the test suite
      // this is the number of asserts in tape
      t.deepEqual(endOfOutput[0], ['1..9'])
      t.deepEqual(endOfOutput[1], ['# tests 9'])
      t.deepEqual(endOfOutput[2], ['# pass  5'])
      t.deepEqual(endOfOutput[3], ['# fail  4'])
      t.deepEqual(endOfOutput[4], [''])

      // this is the number of passed/failed test() in tape
      t.is(stats.pass, 3)
      t.is(stats.fail, 3)
    })
  })

  airtap.run(function (err, ok) {
    t.error(err, 'no error')
    t.is(ok, false, 'test should not pass')
    if (callback) callback()
  })
}
