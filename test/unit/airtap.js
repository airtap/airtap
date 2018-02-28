const test = require('tape')
const path = require('path')
const exec = require('child_process').exec
const airtap = path.resolve(__dirname, '../../bin/airtap.js')

test('exits cleanly and does nothing if no secure travis env', t => {
  const env = Object.assign({}, process.env, {
    TRAVIS_SECURE_ENV_VARS: 'false'
  })
  exec(airtap, { env }, (err, stdout, stderr) => {
    t.error(err, 'no error')
    t.equal(stdout.trim(), 'Skipping airtap due to no secure travis environment!')
    t.end()
  })
})

test('exits with error if no files are specified', t => {
  const env = Object.assign({}, process.env)
  // Delete this to be sure it's undefined
  delete env.TRAVIS_SECURE_ENV_VARS
  exec(airtap, { env }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.equal(stderr.trim(), 'at least one `js` test file must be specified')
    t.end()
  })
})
