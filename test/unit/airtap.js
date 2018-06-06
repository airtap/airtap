var test = require('tape')
var Zuul = require('../../')

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

  var zuul = Zuul(config)

  zuul.browser({
    browser: 'internet explorer',
    version: '11'
  })

  var browser = zuul._browsers[0]
  t.same(browser._conf.capabilities, config.capabilities)
  t.end()
})

test('browsers are deduped', function (t) {
  var zuul = Zuul({})

  zuul.browser({
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  })
  zuul.browser({
    browser: 'iphone',
    version: '11.3',
    platform: 'Mac 10.13'
  })

  var browsers = zuul._browsers

  t.is(browsers.length, 1, 'should be deduped')
  t.is(browsers[0]._conf.browser, 'iphone', '.browser correct')
  t.is(browsers[0]._conf.version, '11.3', '.version correct')
  t.is(browsers[0]._conf.platform, 'Mac 10.13', '.platform correct')

  t.end()
})
