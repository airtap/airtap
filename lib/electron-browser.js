'use strict'

const chalk = require('chalk')
const spawn = require('child_process').spawn
const path = require('path')
const inherits = require('util').inherits
const AbstractBrowser = require('./abstract-browser')

function Electron (config) {
  if (!(this instanceof Electron)) {
    return new Electron(config)
  }

  // Lazily require electron because it is an optional dependency.
  this._bin = require('electron')
  this._version = require('electron/package.json').version
  this._cp = null

  AbstractBrowser.call(this, config)
}

inherits(Electron, AbstractBrowser)

Electron.prototype.toString = function () {
  return `electron:${this._version}`
}

Electron.prototype._start = function (url, cb) {
  const opts = JSON.stringify({ url, show: this.config.live })
  const args = [path.join(__dirname, 'electron-run.js'), opts]
  const cp = this._cp = spawn(this._bin, args)

  cp.stdout.setEncoding('utf8')
  cp.stdout.on('data', function () {})

  cp.stderr.on('data', (data) => {
    if (/INFO:CONSOLE/.test(data)) return
    this.debug(chalk`stderr: {red ${data}}`)
  })

  cp.on('close', (code, signal) => {
    this._cp = null
    if (code) this.stop(new Error(`Exited with code ${code}`))
    else if (signal) this.stop(new Error(`Exited by signal ${signal}`))
    else if (this.config.live) this.stop()
    else this.stop(new Error('Exited prematurely'))
  })

  process.nextTick(() => {
    if (this._cp) cb()
  })
}

// eslint-disable-next-line handle-callback-err
Electron.prototype._stop = function (err, cb) {
  if (this._cp) {
    this._cp.removeAllListeners('close')
    this._cp.on('close', (code) => {
      if (code) cb(new Error(`Exited with code ${code}`))
      else cb()
    })
    this._cp.kill()
    this._cp = null
  } else {
    process.nextTick(cb)
  }
}

module.exports = Electron
