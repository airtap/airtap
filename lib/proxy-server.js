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

module.exports = class ProxyServer extends Nanoresource {
  constructor (manifest, cid, opts) {
    super()

    this.port = null
    this.url = null

    this[kLoopback] = manifest.wants.loopback ? opts.loopback || 'airtap.local' : 'localhost'
    this[kServer] = http.createServer()

    const self = this
    const proxy = httpProxy.createProxy()

    this[kServer].on('request', onRequest(proxy.web.bind(proxy)))
    this[kServer].on('upgrade', onRequest(proxy.ws.bind(proxy)))

    enableDestroy(this[kServer])
    proxy.on('proxyReq', onProxyReq)

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
    lookup(this[kLoopback], { family: 4 }, (err, address) => {
      if (err ? err.code === 'ENOTFOUND' : address !== '127.0.0.1') {
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

class LoopbackError extends Error {
  constructor (loopback) {
    super(`Hostname '${loopback}' must resolve to 127.0.0.1. Please add an entry to your hosts file.`)

    Object.defineProperty(this, 'name', { value: 'LoopbackError' })
    Object.defineProperty(this, 'expected', { value: true })
  }
}
