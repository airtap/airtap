'use strict'

const test = require('tape')
const engineClient = require('engine.io-client')
const EventEmitter = require('events')
const MessageServer = require('../../lib/message-server')

class MockContext extends EventEmitter {
  constructor () {
    super()
    this.destroyed = false
  }

  createSession (callback) {
    process.nextTick(callback, new MockSession())
  }
}

class MockSession extends EventEmitter {
  destroy () {
    // ..
  }
}

test('message server closes open connections', function (t) {
  t.plan(5)

  const server = new MessageServer()

  server.open(function (err) {
    t.ifError(err, 'no open error')
    t.ok(Number.isInteger(server.port) && server.port > 0, 'has port')

    const url = `ws://localhost:${server.port}`
    const cid = 'fake'
    const mockContext = new MockContext()

    server.register(cid, mockContext)

    const socket = engineClient(url, {
      path: '/airtap/msg',
      extraHeaders: {
        'x-airtap-context-id': cid
      }
    })

    socket.on('open', function () {
      t.pass('opened')

      socket.on('close', function () {
        t.pass('closed')
      })

      server.close(function (err) {
        t.ifError(err, 'no close error')
      })
    })
  })
})

test('message server closes if connections were already closed', function (t) {
  t.plan(5)

  const server = new MessageServer()

  server.open(function (err) {
    t.ifError(err, 'no open error')
    t.ok(Number.isInteger(server.port) && server.port > 0, 'has port')

    const url = `ws://localhost:${server.port}`
    const cid = 'fake'
    const mockContext = new MockContext()

    server.register(cid, mockContext)

    const socket = engineClient(url, {
      path: '/airtap/msg',
      extraHeaders: {
        'x-airtap-context-id': cid
      }
    })

    socket.on('open', function () {
      t.pass('opened')

      socket.on('close', function () {
        t.pass('closed')

        server.close(function (err) {
          t.ifError(err, 'no close error')
        })
      })

      socket.close()
    })
  })
})

test('message server closes connection without valid cid', function (t) {
  t.plan(3)

  const server = new MessageServer()

  server.open(function (err) {
    t.ifError(err, 'no open error')

    const socket = engineClient(`ws://localhost:${server.port}`, {
      path: '/airtap/msg'
    })

    socket.on('close', function () {
      t.pass('closed')

      server.close(function (err) {
        t.ifError(err, 'no close error')
      })
    })
  })
})
