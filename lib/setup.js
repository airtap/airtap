var http = require('http')
var httpProxy = require('http-proxy')
var debug = require('debug')('airtap:setup')

var userServer = require('./user-server')

// sets up a test instance
// cb(err, instance)
// instance.shutdown() terminates the instance
function setupTestServer (opts, cb) {
  var supportServer
  var bouncer

  if (opts.server) {
    userServer(opts.server, setup)
  } else {
    setup()
  }

  function setup (err, server) {
    if (err) return cb(err)

    supportServer = server

    var supportsLoopback = !opts.local && !opts.electron
    var loopback = (supportsLoopback && opts.loopback) || 'localhost'

    var supportPort
    if (supportServer) {
      supportPort = opts.support_port = supportServer.port
    }

    // TODO start support server
    // currently happens within userServer

    var bouncerPort = opts.port || 0

    var proxy = httpProxy.createProxy()
    proxy.on('proxyReq', onProxyRequest)

    bouncer = http.createServer()
    bouncer.on('request', onRequest(proxy.web))
    bouncer.on('upgrade', onRequest(proxy.ws))

    function localUrl (port, path) {
      var base = 'http://' + loopback + ':' + port
      return path ? base + path : base
    }

    function onRequest (bounce) {
      return function (req, res) {
        var args = [].slice.call(arguments)
        if (isControlRequest(req)) {
          args.push({ target: localUrl(opts.control_port) })
          bounce.apply(proxy, args)
          return
        }

        args.push({ target: localUrl(supportPort) }, onSupportServerProxyDone)
        bounce.apply(proxy, args)
      }
    }

    function onProxyRequest (proxyReq, req, res, options) {
      if (isControlRequest(req) ||
          (req.headers.connection && req.headers.connection.toLowerCase().indexOf('upgrade') === -1)) {
        proxyReq.setHeader('connection', 'close')
      }
    }

    function onSupportServerProxyDone (err, req, res) {
      if (err.code === 'ECONNRESET' && res && res.socket && res.socket.destroyed === true) {
        debug('Request to support-server:%s was canceled by the client, ignoring the proxy error')
      }
    }

    function isControlRequest (req) {
      var url = req.url.split('?')[0]
      return !supportPort || url.split('/')[1] === 'airtap'
    }

    bouncer.listen(bouncerPort, onBouncerListening)

    function onBouncerListening () {
      var port = bouncer.address().port
      debug('bouncer active on port %d', port)
      cb(null, localUrl(port, '/airtap'))
    };
  }

  function shutdown (cb) {
    bouncer.close(cb)

    if (supportServer) {
      supportServer.process.kill('SIGKILL')
    }
  }

  return {
    shutdown: shutdown
  }
}

module.exports = setupTestServer
