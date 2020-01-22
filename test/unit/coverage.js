'use strict'

const test = require('tape')
const tempy = require('tempy')
const fs = require('fs')
const path = require('path')
const cc = require('../../lib/coverage')

test('write and clean coverage', function (t) {
  t.plan(3)

  const cwd = tempy.directory()
  const nyc = path.join(cwd, '.nyc_output')

  cc.write(cwd, { fake: 123 }, function (err) {
    t.ifError(err)

    t.same(fs.readdirSync(nyc), [
      'airtap-0772e0c7c3987f74bb8a740830f7ed2a462a3067.json'
    ])

    fs.writeFileSync(path.join(nyc, 'other'), '')
    cc.clean(cwd)

    t.same(fs.readdirSync(nyc), ['other'])
  })
})

for (const arg of [null, undefined, {}]) {
  test(`coverage is ignored if it's ${JSON.stringify(arg)}`, function (t) {
    t.plan(2)

    const cwd = tempy.directory()
    const nyc = path.join(cwd, '.nyc_output')

    cc.write(cwd, arg, function (err) {
      t.ifError(err)
      fs.readdir(nyc, function (err) {
        t.is(err.code, 'ENOENT')
      })
    })
  })
}
