'use strict'

const httpProxy = require('http-proxy')
const debug = require('debug')('airtap:proxy-server')
const silly = require('debug')('silly:airtap:proxy-server')
const memoize = require('thunky-with-args')
const enableDestroy = require('server-destroy')
const lookup = memoize(require('dns').lookup)
const Nanoresource = require('nanoresource')
const transient = require('transient-error')
const http = require('http')

const kLoopback = Symbol('kLoopback')
const kServer = Symbol('kServer')
const kUrl = Symbol('kUrl')
const ip = '127.0.0.1'

module.exports = class ProxyServer extends Nanoresource {
  constructor (manifest, cid, opts) {
    super()

    this.port = null
    this.url = null

    this[kLoopback] = opts.loopback || (manifest.wants.loopback ? 'airtap.local' : 'localhost')
    this[kServer] = http.createServer()

    const self = this
    const proxy = httpProxy.createProxy()

    this[kServer].on('request', onRequest(proxy.web.bind(proxy)))
    this[kServer].on('upgrade', onRequest(proxy.ws.bind(proxy)))
    this[kServer].on('error', ignorePrematureClose)

    enableDestroy(this[kServer])

    proxy.on('proxyReq', onProxyReq)
    proxy.on('error', ignorePrematureClose)
    proxy.onError = ignorePrematureClose

    function onProxyReq (proxyReq, req, res, options) {
      proxyReq.setHeader('x-airtap-context-id', cid)
    }

    function onRequest (handler) {
      return function onRequest (req, res, head) {
        silly('%s %s', req.method, req.url)

        if (req.url.startsWith('/airtap/msg')) {
          handler(req, res, { target: self[kUrl](opts.messagePort) })
        } else if (req.url.startsWith('/airtap')) {
          handler(req, res, { target: self[kUrl](opts.contentPort) })
        } else if (opts.supportPort) {
          handler(req, res, { target: self[kUrl](opts.supportPort) })
        } else {
          res.statusCode = 404
          res.end()
        }
      }
    }
  }

  _open (callback) {
    maybeLookup(this[kLoopback], { family: 4 }, (err, address) => {
      if (err ? err.code === 'ENOTFOUND' : address !== ip) {
        return callback(new LoopbackError(this[kLoopback]))
      } else if (err) {
        return callback(transient(err))
      }

      this[kServer].listen(0, () => {
        this.port = this[kServer].address().port
        this.url = this[kUrl](this.port, '/airtap')

        debug('active on %s:%o', this[kLoopback], this.port)
        callback()
      })
    })
  }

  _close (callback) {
    // Terminate connections and close server
    this[kServer].destroy(callback)
  }

  [kUrl] (port, path) {
    const base = 'http://' + this[kLoopback] + ':' + port
    return path ? base + path : base
  }
}

function ignorePrematureClose (err) {
  if (err.code === 'ECONNRESET') {
    debug('Socket closed prematurely')
  } else {
    throw err
  }
}

function maybeLookup (hostname, opts, callback) {
  if (hostname === ip) {
    process.nextTick(callback, null, ip)
  } else {
    lookup(hostname, opts, callback)
  }
}

class LoopbackError extends Error {
  constructor (loopback) {
    super(`Hostname '${loopback}' must resolve to ${ip}. Please add an entry to your hosts file.`)

    Object.defineProperty(this, 'name', { value: 'LoopbackError' })
    Object.defineProperty(this, 'expected', { value: true })
  }
}
