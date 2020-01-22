'use strict'

const { Transform } = require('readable-stream')
const transient = require('transient-error')
const debug = require('debug')('airtap:browser-session')
const format = require('util').format
const Parser = require('tap-completed')
const timeout = require('./timeout')
const Stats = require('./stats')
const cc = require('./coverage')

const kSuffix = Symbol('kSuffix')
const kTitle = Symbol('kTitle')
const kSawLine = Symbol('kSawLine')
const kAnnotate = Symbol('kAnnotate')
const kParser = Symbol('kParser')
const kIdleTimer = Symbol('kIdleTimer')
const kResetIdleTimer = Symbol('kResetIdleTimer')
const kTimeout = Symbol('kTimeout')
const kClientErrored = Symbol('kClientErrored')
const kCwd = Symbol('kCwd')

let seq = 0

class BrowserSession extends Transform {
  constructor (title, timeout, cwd, annotate) {
    super({
      objectMode: true,

      // Required until readable-stream updates to node 14
      autoDestroy: true
    })

    this.stats = new Stats(false, 0, 0)

    // Would like to merge TAP of multiple browsers into one TAP stream, but
    // there's no standardized way to format that. The closest thing is indenting
    // subtests in the style of node-tap but that doesn't work for parallel tests
    // unless we buffer results which is not ideal for an entire test suite. For
    // now, append a sequence number to lines so at least humans can identify
    // which lines are from which browser.
    this[kSuffix] = `[${++seq}]`
    this[kTitle] = title
    this[kSawLine] = false
    this[kAnnotate] = annotate !== false
    this[kIdleTimer] = null
    this[kTimeout] = timeout
    this[kClientErrored] = false
    this[kCwd] = cwd

    // Don't care about diagnostics after completion, don't wait.
    this[kParser] = Parser({ wait: 0 })

    this[kResetIdleTimer]()
    this[kParser].on('complete', (results) => {
      this.stats.ok = results.ok
      this.stats.pass = results.pass
      this.stats.fail = results.fail

      debug('session %o complete (%s)', this[kTitle], this.stats.ok ? 'ok' : 'not ok')
      this.emit('complete', this.stats)
    })

    debug('session %o', this[kTitle])
  }

  _destroy (reason, cb) {
    if (reason) debug('destroy %o: %O', this[kTitle], reason)
    clearTimeout(this[kIdleTimer])
    this[kParser].destroy()
    cb(reason)
  }

  [kResetIdleTimer] () {
    if (this[kIdleTimer]) {
      this[kIdleTimer].refresh()
      return
    }

    this[kIdleTimer] = timeout.optional(() => {
      const msg = `Did not receive output from '${this[kTitle]}'`
      const err = new timeout.Error(msg, this[kTimeout])

      // Retry unless the last thing we saw was an error from the client
      if (!this[kClientErrored]) transient(err)

      this.destroy(err)
    }, this[kTimeout])
  }

  _transform (msg, enc, next) {
    this[kResetIdleTimer]()
    this[kClientErrored] = false

    if (msg.type === 'console') {
      const line = format(...msg.args) + '\n'

      if (msg.level !== 'log') {
        process.stderr.write(`stderr (${this[kTitle]}): ${line}`)
        return next()
      } else if (line === 'Bail out!') {
        return next(new Error('Bail out'))
      } else if (this[kAnnotate] && !this[kSawLine]) {
        this[kSawLine] = true
        this.push(`${line}# ${this[kTitle]} ${this[kSuffix]}\n`)
      } else if (this[kAnnotate] && /^(#|ok|not ok) /.test(line)) {
        this.push(line.replace(/\r?\n/, ' ' + this[kSuffix] + '\n'))
      } else {
        this.push(line)
      }

      if (!this[kParser].write(line)) {
        this[kParser].once('drain', next)
      } else {
        next()
      }
    } else if (msg.type === 'error' && msg.fatal) {
      next(new Error(String(msg.message || 'Client error')))
    } else if (msg.type === 'error') {
      this[kClientErrored] = true
      const { type, ...rest } = msg
      console.error(`client error (${this[kTitle]}): ${format(rest)}`)
      next()
    } else if (msg.type === 'end') {
      debug('ending %o', this[kTitle])

      cc.write(this[kCwd], msg.coverage, (err) => {
        if (err) return next(err)
        this.end()
        next()
      })
    } else {
      // TODO: why doesn't this work?
      // next(new Error('Unknown message type'))

      this.destroy(new Error('Unknown message type'))
    }
  }
}

module.exports = BrowserSession

// For unit tests. Should move state elsewhere.
BrowserSession.reset = function () {
  seq = 0
}
