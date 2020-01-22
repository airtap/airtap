require('./unit/bundler')
require('./unit/cli')
require('./unit/coverage')
require('./unit/stats')
require('./unit/timeout')
require('./unit/test')

require('./unit/browser-context')
require('./unit/browser-session')
require('./unit/content-server')
require('./unit/message-server')

// TODO
// require('./unit/proxy-server')
// require('./unit/support-server')

if (!process.env.CI) {
  const test = require('tape')
  const integration = require('./integration')
  const Default = require('airtap-default')

  integration(test, Default)
}
