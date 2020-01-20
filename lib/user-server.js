var spawn = require('child_process').spawn
var http = require('http')
var parseCmd = require('shell-quote').parse
var debug = require('debug')('airtap:support-server')

module.exports = function (server, callback) {
  debug('%O', server)

  var cmd
  var cwd
  var wait = 0
  if (server !== null && server.cmd) {
    // expect the following format in .airtap.yml
    // server:
    //   cmd: ./test/support/server.js
    //   cwd: ./anotherapp
    cmd = server.cmd
    cwd = server.cwd
    wait = server.wait
  } else {
    // expect the following format in .airtap.yml
    // server: ./test/support/server.js
    cmd = server
  }

  if (!cwd) {
    // TODO: use config.prj_dir
    cwd = process.cwd()
  }

  var env = Object.assign({}, process.env)

  getOpenPort(function (err, port) {
    if (err) return callback(err)

    if (!Array.isArray(cmd)) {
      cmd = parseCmd(cmd, { AIRTAP_SUPPORT_PORT: port })
    }

    if (/\.js$/.test(cmd[0])) {
      cmd.unshift(process.execPath)
    }

    env.AIRTAP_SUPPORT_PORT = port

    debug('active on port %d', port)

    var ps = spawn(cmd[0], cmd.slice(1), { cwd: cwd, env: env })
    var exited = false

    ps.stdout.pipe(process.stderr)
    ps.stderr.pipe(process.stderr)

    function close (cb) {
      if (exited) return process.nextTick(cb)

      ps.removeListener('exit', onexit)
      ps.once('exit', (code) => {
        exited = true
        cb(code ? new Error(`Support server exited with code ${code}`) : null)
      })

      ps.kill()
    }

    function onexit (code) {
      exited = true
      if (code) throw new Error(`Support server exited with code ${code}`)
    }

    ps.once('exit', onexit)

    // TODO: wait until server accepts a connection?
    return setTimeout(function () {
      callback(null, { port, close })
    }, wait || 100)
  })
}

function getOpenPort (callback) {
  var server = http.createServer()
  server.listen(0)
  server.on('listening', function () {
    var port = server.address().port
    server.close(function () {
      callback(null, port)
    })
  })
}
