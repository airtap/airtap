var spawn = require('child_process').spawn
var http = require('http')
var parseCmd = require('shell-quote').parse
var debug = require('debug')('airtap:user-server')

module.exports = function (server, callback) {
  debug('user server: %s', server)

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
    // TODO(shtylman) is this right?
    cwd = process.cwd()
  }

  var env = Object.assign({}, process.env)

  getOpenPort(function (err, port) {
    if (err) return callback(err)

    if (!Array.isArray(cmd)) {
      cmd = parseCmd(cmd, { AIRTAP_PORT: port })
    }

    if (/\.js$/.test(cmd[0])) {
      cmd.unshift(process.execPath)
    }

    env.AIRTAP_PORT = port

    debug('user server port %d', port)

    var ps = spawn(cmd[0], cmd.slice(1), { cwd: cwd, env: env })
    ps.stdout.pipe(process.stdout)
    ps.stderr.pipe(process.stderr)

    function exit () {
      ps.kill('SIGTERM')
    }

    ps.once('exit', function (code) {
      debug('user server exited with status: %d', code)
      process.removeListener('exit', exit)
    })

    process.on('exit', exit)

    return setTimeout(function () {
      callback(null, { port: port, process: ps })
    }, wait)
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
