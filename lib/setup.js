var http = require('http')
var httpProxy = require('http-proxy')
var debug = require('debug')('airtap:test-server')
var createSupportServer = require('./user-server')
var createEngineServer = require('./engine-server')

// sets up a test server
// callback(err, testServer)
// testServer.close() terminates the server
function createTestServer (browser, controlPort, config, callback) {
  if (config.server) {
    createSupportServer(config.server, setup)
  } else {
    setup()
  }

  function setup (err, supportServer) {
    if (err) return callback(err)

    var supportPort = supportServer ? supportServer.port : null
    var bouncerPort = config.port || 0
    var supportsLoopback = !config.local && !config.electron
    var loopback = (supportsLoopback && config.loopback) || 'localhost'
    var engineServer = createEngineServer(browser)
    var enginePort

    // Put servers behind a single-port proxy to avoid CORS issues
    var proxy = httpProxy.createProxy()
    var bouncer = http.createServer()

    bouncer.on('request', onRequest(proxy.web))
    bouncer.on('upgrade', onRequest(proxy.ws))

    function localUrl (port, path) {
      var base = 'http://' + loopback + ':' + port
      return path ? base + path : base
    }

    function onRequest (bounce) {
      return function (req, res) {
        var args = [].slice.call(arguments)

        if (req.url.startsWith('/engine.io')) {
          args.push({ target: localUrl(enginePort) })
          bounce.apply(proxy, args)
        } else if (req.url.startsWith('/airtap')) {
          args.push({ target: localUrl(controlPort) })
          bounce.apply(proxy, args)
        } else if (supportServer) {
          args.push({ target: localUrl(supportPort) })
          bounce.apply(proxy, args)
        } else {
          res.statusCode = 404
          res.end()
        }
      }
    }

    let pending = 2

    bouncer.listen(bouncerPort, onBouncerListening)
    engineServer.listen(0, onEngineListening)

    function onBouncerListening () {
      bouncerPort = this.address().port
      debug('bouncer active on port %d', bouncerPort)
      next()
    }

    function onEngineListening () {
      enginePort = this.address().port
      debug('engine active on port %d', enginePort)
      next()
    }

    function next () {
      if (--pending === 0) {
        callback(null, { url: localUrl(bouncerPort, '/airtap'), close })
      }
    }

    function close (callback) {
      let pending = 3
      let error

      engineServer.close(next)
      bouncer.close(next)

      if (supportServer) supportServer.close(next)
      else next()

      function next (err) {
        error = error || err
        if (--pending === 0) callback(error)
      }
    }
  }
}

module.exports = createTestServer
