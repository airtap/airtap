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
    name: 'internet explorer',
    version: '11'
  })

  var browser = zuul._browsers[0]
  t.same(browser._conf.capabilities, config.capabilities)
  t.end()
})
