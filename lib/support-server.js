'use strict'

const spawn = require('child_process').spawn
const http = require('http')
const parseCmd = require('shell-quote').parse
const Nanoresource = require('nanoresource')
const debug = require('debug')('airtap:support-server')
const path = require('path')

const kProcess = Symbol('kProcess')

module.exports = class SupportServer extends Nanoresource {
  constructor (options) {
    super()

    if (typeof options === 'string' || Array.isArray(options)) {
      options = { cmd: options }
    }

    this.cmd = options.cmd
    this.cwd = path.resolve(options.cwd || '.')
    this.wait = options.wait || 1e3
    this.port = null

    this[kProcess] = null
  }

  _open (callback) {
    getOpenPort((err, port) => {
      if (err) return callback(err)

      // Stdout is reserved for TAP
      const stdio = ['ignore', 2, 2]
      const vars = { AIRTAP_SUPPORT_PORT: port }
      const cmd = Array.isArray(this.cmd) ? this.cmd.slice() : parseCmd(this.cmd, vars)
      const env = { ...process.env, ...vars }

      if (cmd[0].endsWith('.js')) {
        cmd.unshift(process.execPath)
      } else if (process.platform === 'win32' && isNpm(cmd[0])) {
        cmd[0] = cmd[0] + '.cmd'
      }

      this[kProcess] = spawn(cmd[0], cmd.slice(1), { cwd: this.cwd, stdio, env })
      this[kProcess].on('exit', (code) => {
        // No opinion on whether this constitutes an error
        debug('exited with code %o', code)
        this[kProcess] = null
      })

      this.port = port

      debug('active on port %o, pid %o', port, this[kProcess].pid)
      setTimeout(callback, this.wait)
    })
  }

  _close (callback) {
    if (this[kProcess] === null) {
      return callback()
    }

    debug('closing pid %d', this[kProcess].pid)

    this[kProcess].once('exit', () => callback())
    this[kProcess].kill()
  }
}

function isNpm (command) {
  return command === 'npm' || command === 'npx'
}

function getOpenPort (callback) {
  http.createServer().listen(0, function () {
    const port = this.address().port

    this.close(function () {
      callback(null, port)
    })
  })
}
