'use strict'

const test = require('tape')
const get = require('simple-get')
const fs = require('fs')
const path = require('path')
const ContentServer = require('../../lib/content-server')

test('content server', function (t) {
  t.plan(23)

  const server = new ContentServer([], {
    cwd: '.',
    watchify: false,
    live: false
  })

  server.open(function (err) {
    t.ifError(err, 'no open error')
    t.ok(Number.isInteger(server.port) && server.port > 0, 'has port')

    const url = `http://localhost:${server.port}`

    server.active()
    get.concat(`${url}/airtap`, function (err, res, data) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 200)
      t.is(res.headers['content-type'], 'text/html; charset=utf-8')
      t.same(data, fs.readFileSync(path.resolve(__dirname, '../../client/index.html')))
      server.inactive()
    })

    server.active()
    get.concat(`${url}/airtap/client.js`, function (err, res, data) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 200)
      t.is(res.headers['content-type'], 'application/javascript; charset=utf-8')
      t.ok(data.length)
      server.inactive()
    })

    server.active()
    get.concat(`${url}/airtap/test.js`, function (err, res, data) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 200)
      t.is(res.headers['content-type'], 'application/javascript; charset=utf-8')
      t.ok(data.length)
      server.inactive()
    })

    server.active()
    get.concat(`${url}/airtap/favicon.ico`, function (err, res, data) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 200)
      t.is(res.headers['content-type'], 'image/x-icon')
      t.same(data, fs.readFileSync(path.resolve(__dirname, '../../client/favicon.ico')))
      server.inactive()
    })

    server.active()
    get.concat(`${url}/airtap/nope`, function (err, res) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 404)
      server.inactive()
    })

    server.active()
    get.concat(url, function (err, res) {
      t.ifError(err, 'no get error')
      t.is(res.statusCode, 404)
      server.inactive()
    })

    server.close(function (err) {
      t.ifError(err, 'no close error')
    })
  })
})
