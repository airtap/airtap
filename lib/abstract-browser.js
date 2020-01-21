'use strict'

const humanizeDuration = require('humanize-duration')
const debug = require('debug')
const mkdirp = require('mkdirp')
const EventEmitter = require('events')
const inherits = require('util').inherits
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Parser = require('./tap-finished')
const recoverable = require('./recoverable')

function AbstractBrowser (config, supports) {
  if (!(this instanceof AbstractBrowser)) {
    return new AbstractBrowser(config, supports)
  }

  this.config = config || {}
  this.stats = new Stats()
  this.debug = debug(`airtap:${this}`)

  this.supports = Object.assign({
    loopback: false,
    sauceConnect: false
  }, supports)

  this._status = 'stopped'
  this._parser = null
  this._idleTimer = null
  this._resetIdleTimer = this._resetIdleTimer.bind(this)

  EventEmitter.call(this)
}

inherits(AbstractBrowser, EventEmitter)

AbstractBrowser.prototype.toString = function () {
  return 'abstract'
}

AbstractBrowser.prototype.run = function (url, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  if (this._status !== 'stopped') {
    throw new Error('Cannot run until stopped')
  }

  const retries = opts.retries || 0

  this.once('stop', (err, stats) => {
    if (err) {
      if (retries > 0 && err.recoverable) {
        this.emit('restart')
        return this.run(url, { retries: retries - 1 }, callback)
      }

      // Prefix message with browser name
      Object.defineProperty(err, 'message', {
        value: `${this} - ${err.message}`
      })

      return callback(err)
    }

    callback(null, stats)
  })

  this.start(url)
}

AbstractBrowser.prototype.start = function (url) {
  if (this._status !== 'stopped') {
    throw new Error('Cannot start until stopped')
  }

  this._status = 'started'
  this.reset()
  this.emit('start', url)

  this._start(url, (err) => {
    // Note: may already have stopped in the mean time.
    if (err) return this.stop(err)
  })
}

AbstractBrowser.prototype._start = function (url, callback) {
  process.nextTick(callback)
}

AbstractBrowser.prototype.reset = function () {
  if (this._status !== 'started') return
  if (this._parser) this._parser.destroy()

  this._resetIdleTimer()
  this.stats = new Stats()

  this._parser = Parser((results) => {
    // if no tests passed, then this is also a problem
    // indicates potential error to even run tests
    this.stats.ok = results.ok && results.fail === 0 && results.pass > 0
    this.stats.pass = results.pass
    this.stats.fail = results.fail

    this.emit('complete', this.stats)
  })
}

AbstractBrowser.prototype._resetIdleTimer = function () {
  clearTimeout(this._idleTimer)
  this.removeListener('message', this._resetIdleTimer)

  if (this.config.idle_timeout > 0 && !this.config.live) {
    this._idleTimer = setTimeout(() => {
      const duration = humanizeDuration(this.config.idle_timeout)
      this.stop(recoverable(new Error(`Did not receive output for ${duration}, stopping`)))
    }, this.config.idle_timeout)

    this.once('message', this._resetIdleTimer)
  }
}

AbstractBrowser.prototype.handleMessage = function (msg) {
  if (this._status !== 'started') return

  this.emit('message', msg)

  if (msg.type === 'console' && msg.level === 'log' && this._parser) {
    this._parser.write(msg.args[0] + '\n')
  } else if (msg.type === 'complete') {
    this.debug('client complete')
    this._writeCoverage(msg.coverage, (err) => {
      if (err) this.debug('failed to write coverage: %O', err)
      if (!this.config.live) this.stop()
    })
  }
}

AbstractBrowser.prototype._writeCoverage = function (coverage, callback) {
  if (!coverage) return process.nextTick(callback)

  // Use browser.toString() as unique filename
  // TODO: rimraf basedir/* (but just once, on startup)
  const basedir = path.join(this.config.prj_dir, '.nyc_output')
  const name = crypto.createHash('sha1').update(this.toString()).digest('hex')
  const fp = path.join(basedir, 'airtap-' + name + '.json')

  mkdirp(basedir, function (err) {
    if (err) return callback(err)
    fs.writeFile(fp, JSON.stringify(coverage), callback)
  })
}

AbstractBrowser.prototype.stop = function (err, callback) {
  if (typeof err === 'function') {
    callback = err
    err = null
  }

  if (callback) {
    if (this._status === 'stopped') {
      process.nextTick(callback, err, this.stats)
    } else {
      this.once('stop', callback)
    }
  }

  if (this._status === 'stopping') return
  if (this._status === 'stopped') return

  this._status = 'stopping'
  this.emit('stopping')
  this._parser = null
  clearTimeout(this._idleTimer)
  this.removeListener('message', this._resetIdleTimer)

  this._stopWithTimeout(err || null, (err2) => {
    this._status = 'stopped'
    this.emit('stop', err || err2 || null, this.stats)
  })
}

AbstractBrowser.prototype._stopWithTimeout = function (err, callback) {
  let called = false

  const timer = setTimeout(function () {
    called = true
    callback(new Error('Timed out waiting for browser to stop'))
  }, 30e3)

  this._stop(err, function (err) {
    if (called) return
    clearTimeout(timer)
    callback(err)
  })
}

// eslint-disable-next-line handle-callback-err
AbstractBrowser.prototype._stop = function (err, callback) {
  process.nextTick(callback)
}

function Stats () {
  this.ok = false
  this.pass = 0
  this.fail = 0
}

module.exports = AbstractBrowser
