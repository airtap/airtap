var test = require('tape')

test('timeout', { timeout: 60e3 }, function (t) {
  t.plan(1)
})
