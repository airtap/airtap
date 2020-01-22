'use strict'

const http = require('http')
const Engine = require('engine.io')
const debug = require('debug')('airtap:message-server')
const Nanoresource = require('nanoresource')
const enableDestroy = require('server-destroy')

const kServer = Symbol('kServer')
const kEngine = Symbol('kEngine')
const kContexts = Symbol('kContexts')
const kOnConnection = Symbol('kOnConnection')

module.exports = class MessageServer extends Nanoresource {
  constructor () {
    super()

    this[kServer] = http.createServer()
    this[kEngine] = Engine.attach(this[kServer], { path: '/airtap/msg' })
    this[kContexts] = new Map()
    this[kEngine].on('connection', this[kOnConnection].bind(this))

    enableDestroy(this[kServer])
  }

  _open (callback) {
    this[kServer].listen(0, () => {
      debug('active on port %o', this.port)
      callback()
    })
  }

  get port () {
    return this[kServer].address().port
  }

  [kOnConnection] (socket) {
    const cid = socket.request.headers['x-airtap-context-id']
    const context = this[kContexts].get(cid)

    if (context == null || context.destroyed) {
      debug('client connected to old or non-existing context: %o', cid)
      socket.close()
      return
    }

    context.createSession(function (session) {
      if (socket.readyState !== 'open') {
        debug('client disconnected before session could start')
        return
      }

      startSession(socket, session, context)
    })
  }

  register (cid, context) {
    this[kContexts].set(cid, context)
  }

  deregister (cid) {
    this[kContexts].delete(cid)
  }

  _close (callback) {
    // Forcefully close sockets
    for (const k in this[kEngine].clients) {
      this[kEngine].clients[k].closeTransport(true)
    }

    if (this[kEngine].ws) {
      this[kEngine].ws.close()
    }

    // Terminate connections and close server
    this[kServer].destroy(callback)
  }
}

function startSession (socket, session, context) {
  socket.on('message', onMessage)
  socket.on('close', onCloseSocket)
  session.on('complete', onComplete)
  session.on('close', onCloseSession)
  context.on('reload', onReload)

  socket.send(JSON.stringify({ type: 'start' }))

  function onMessage (json) {
    const msg = JSON.parse(json)

    if (session.destroyed) {
      debug('received message for destroyed session: %O', msg)
      return
    }

    session.write(msg)
  }

  function onReload () {
    socket.send(JSON.stringify({ type: 'reload' }))
  }

  function onCloseSocket () {
    socket.removeListener('message', onMessage)
    socket.removeListener('close', onCloseSocket)
    session.removeListener('complete', onComplete)
    session.removeListener('close', onCloseSession)
    context.removeListener('reload', onReload)

    session.destroy()
  }

  function onCloseSession () {
    session.removeListener('complete', onComplete)
    session.removeListener('close', onCloseSession)
  }

  function onComplete (stats) {
    const supports = context.browser.manifest.supports

    socket.send(JSON.stringify({
      type: 'end',
      ok: stats.ok,
      live: context.live,
      selfclosing: supports.selfclosing
    }))
  }
}
