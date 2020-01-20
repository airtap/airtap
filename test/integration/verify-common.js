module.exports = function (t, airtap, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  } else if (!opts) {
    opts = {}
  }

  let expectedRetries = opts.expectedRetries || 0
  const count = airtap._browsers.length || 1
  const assertionsPerBrowser = 9 + expectedRetries

  t.plan(count * assertionsPerBrowser + 2)

  for (const browser of airtap) {
    const consoleOutput = []
    let starts = 0

    browser.on('message', function (msg) {
      if (msg.type === 'console' && msg.level === 'log') {
        consoleOutput.push(msg.args)
      }
    })

    browser.on('starting', function () {
      // If there's an error, starting will be emitted on each retry.
      starts++
    })

    browser.on('stop', function (err, stats) {
      if (expectedRetries-- > 0) {
        t.ok(err, 'got error')
        return
      }

      const endOfOutput = consoleOutput.slice(-5)

      t.is(err, null, 'no error on stop')
      t.ok(starts > 0, 'browser emitted "starting" ' + starts + ' times')

      // check that we did output until the end of the test suite
      // this is the number of assertions in tape
      t.deepEqual(endOfOutput[0], ['1..9'])
      t.deepEqual(endOfOutput[1], ['# tests 9'])
      t.deepEqual(endOfOutput[2], ['# pass  5'])
      t.deepEqual(endOfOutput[3], ['# fail  4'])
      t.deepEqual(endOfOutput[4], [''])

      t.is(stats.pass, 5, 'pass 5')
      t.is(stats.fail, 4, 'fail 4')
    })
  }

  airtap.run(function (err, ok) {
    t.error(err, 'no error')
    t.is(ok, false, 'test should not pass')
    if (callback) callback()
  })
}
