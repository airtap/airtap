const test = require('tape')
const aggregate = require('../../lib/aggregate-browsers')
const allBrowsers = require('../fixtures/all-browsers.json')
const expected = require('../fixtures/aggregated-browsers.json')

test('aggregate browsers', function (t) {
  t.same(aggregate(allBrowsers), expected, 'correct aggregation')
  t.end()
})
