const test = require('tape')
const path = require('path')
const exec = require('child_process').exec
const airtap = path.resolve(__dirname, '../../bin/airtap.js')
const messages = require('../../lib/messages')

test('exits cleanly and does nothing if no secure travis env', t => {
  const env = Object.assign({}, process.env, {
    TRAVIS_SECURE_ENV_VARS: 'false',
    FORCE_COLOR: '0'
  })
  exec('node ' + airtap, { env }, (err, stdout, stderr) => {
    t.error(err, 'no error')
    t.equal(stdout.trim(), messages.SKIPPING_AIRTAP)
    t.end()
  })
})

test('exits with error if no files are specified', t => {
  const env = Object.assign({}, process.env, {
    FORCE_COLOR: '0'
  })
  // Delete this to be sure it's undefined
  delete env.TRAVIS_SECURE_ENV_VARS
  exec('node ' + airtap, { env }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.equal(stderr.trim(), messages.NO_FILES)
    t.end()
  })
})
