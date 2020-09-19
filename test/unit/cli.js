'use strict'

const test = require('tape')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const exec = require('child_process').exec
const tempy = require('tempy')

const version = require('../../package.json').version
const dir = path.resolve(__dirname, '../../bin')
const bin = path.join(dir, 'airtap.js')
const read = (fp) => fs.readFileSync(path.join(dir, fp), 'utf8')
const env = Object.assign({}, process.env, { FORCE_COLOR: '0' })

test('cli prints out version with -v', function (t) {
  exec(`node ${bin} -v`, { env }, (err, stdout, stderr) => {
    t.ifError(err, 'no error')
    t.is(stdout.trim(), version)
    t.is(stderr.trim(), '')
    t.end()
  })
})

test('cli errors if no files are specified', function (t) {
  exec(`node ${bin}`, { env }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.is(stderr.trim(), 'At least one file must be specified.')
    t.end()
  })
})

for (const input of [[]]) {
  test('cli errors if providers is ' + JSON.stringify(input), function (t) {
    const cwd = tempy.directory()
    const config = input === undefined ? {} : { providers: input }

    writeConfig(cwd, { ...config })

    exec(`node ${bin} test.js`, { env, cwd }, (err, stdout, stderr) => {
      t.ok(err, 'should error')
      t.is(stderr.trim(), read('no-input.txt').trim())
      t.end()
    })
  })
}

for (const input of [undefined, []]) {
  test('cli errors if browsers is ' + JSON.stringify(input), function (t) {
    const cwd = tempy.directory()
    const config = input === undefined ? {} : { browsers: input }

    writeConfig(cwd, { providers: ['airtap-default'], ...config })

    exec(`node ${bin} test.js`, { env, cwd }, (err, stdout, stderr) => {
      t.ok(err, 'should error')
      t.is(stderr.trim(), read('no-input.txt').trim())
      t.end()
    })
  })
}

test('cli errors if legacy --electron flag is set', function (t) {
  const cwd = tempy.directory()

  writeConfig(cwd, {
    providers: ['airtap-ignored-foo'],
    browsers: [{ name: 'test' }]
  })

  exec(`node ${bin} --electron test.js`, { env, cwd }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.is(stderr.trim(), read('no-electron.txt').trim())
    t.end()
  })
})

test('cli errors if legacy --local flag is set', function (t) {
  const cwd = tempy.directory()

  writeConfig(cwd, {
    providers: ['airtap-ignored-foo'],
    browsers: [{ name: 'test' }]
  })

  exec(`node ${bin} --local test.js`, { env, cwd }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.is(stderr.trim(), read('no-local.txt').trim())
    t.end()
  })
})

test('cli errors if legacy --local and --open flags are set', function (t) {
  const cwd = tempy.directory()

  writeConfig(cwd, {
    providers: ['airtap-ignored-foo'],
    browsers: [{ name: 'test' }]
  })

  exec(`node ${bin} --local --open test.js`, { env, cwd }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.is(stderr.trim(), read('no-local-open.txt').trim())
    t.end()
  })
})

test('cli errors if provider does not exist', function (t) {
  const cwd = tempy.directory()

  writeConfig(cwd, {
    providers: ['airtap-non-existing-abc'],
    browsers: [{ name: 'test' }]
  })

  exec(`node ${bin} test.js`, { env, cwd }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.ok(/cannot find module/i.test(stderr))
    t.end()
  })
})

test('cli warns if sauce labs credentials are provided in root config', function (t) {
  const cwd = tempy.directory()
  const expected = read('deprecated-creds.txt')

  writeConfig(cwd, {
    username: 'test',
    key: 'test',
    providers: ['airtap-ignored-abc'],
    browsers: [{ name: 'test' }]
  })

  exec(`node ${bin} test.js`, { env, cwd }, (err, stdout, stderr) => {
    t.ok(err, 'should error')
    t.is(stderr.trim().slice(0, expected.length), expected)
    t.end()
  })
})

function writeConfig (cwd, config) {
  fs.writeFileSync(path.join(cwd, '.airtap.yml'), toYAML(config))
}

function toYAML (value) {
  return yaml.safeDump(value, { noRefs: true }).trim()
}
