'use strict'

const http = require('http')
const Engine = require('engine.io')

module.exports = function (browser) {
  // TODO: get path option to work (e.g. /airtap/ws)
  const server = http.createServer()
  const engine = Engine.attach(server)

  engine.on('connection', function (socket) {
    socket.on('message', onmessage)
    socket.on('close', onclose)

    browser.reset()
    browser.on('complete', oncomplete)

    function onmessage (msg) {
      browser.handleMessage(JSON.parse(msg))
    }

    function onclose () {
      browser.removeListener('complete', oncomplete)
    }

    function oncomplete (stats) {
      socket.send(JSON.stringify({ type: 'complete', ok: stats.ok }))
    }
  })

  return {
    listen (...args) {
      server.listen(...args)
    },
    close (callback) {
      engine.close()
      server.close(callback)
    }
  }
}
