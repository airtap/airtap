var test = require('tape')
var Airtap = require('../../')

test('capabilities config', function (t) {
  var config = {
    capabilities: {
      'custom-data': {
        public: 'private'
      }
    },
    sauce_connect: true,
    loopback: 'airtap.local'
  }

  var airtap = Airtap(config)

  airtap.browser({
    browser: 'internet explorer',
    version: '11'
  })

  var browser = airtap._browsers[0]
  t.same(browser._conf.capabilities, config.capabilities)
  t.end()
})

test('browsers are deduped', function (t) {
  var airtap = Airtap({})

  airtap.browser({
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  })
  airtap.browser({
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  })

  var browsers = airtap._browsers

  t.is(browsers.length, 1, 'should be deduped')
  t.is(browsers[0]._conf.browser, 'iphone', '.browser correct')
  t.is(browsers[0]._conf.version, '11.3', '.version correct')
  t.is(browsers[0]._conf.platform, 'Mac 10.13', '.platform correct')

  t.end()
})
