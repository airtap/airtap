'use strict'

const EventEmitter = require('events')
const osc = require('on-stream-close')
const combine = require('maybe-combine-errors')
const ms = require('bruce-millis-option')
const transient = require('transient-error')
const debug = require('debug')('airtap:browser-context')
const path = require('path')
const BrowserSession = require('./browser-session')
const timeout = require('./timeout')

const kBrowser = Symbol('kBrowser')
const kCwd = Symbol('kCwd')
const kAnnotate = Symbol('kAnnotate')
const kLive = Symbol('kLive')
const kErrors = Symbol('kErrors')
const kReady = Symbol('kReady')
const kDestroyed = Symbol('kDestroyed')
const kSession = Symbol('kSession')
const kOnReady = Symbol('kOnReady')
const kOnSignal = Symbol('kOnSignal')
const kOffSignal = Symbol('kOffSignal')
const kStartTimer = Symbol('kStartTimer')
const kTimeout = Symbol('kTimeout')

module.exports = class BrowserContext extends EventEmitter {
  constructor (browser, options) {
    super()

    this[kBrowser] = browser
    this[kCwd] = path.resolve(options.cwd || '.')
    this[kLive] = !!options.live
    this[kAnnotate] = options.annotate !== false
    this[kErrors] = []
    this[kReady] = false
    this[kDestroyed] = false
    this[kSession] = null
    this[kOffSignal] = null
    this[kStartTimer] = null
    this[kTimeout] = options.live ? 0 : ms(options.timeout || '5m')
  }

  get live () {
    return this[kLive]
  }

  get browser () {
    return this[kBrowser]
  }

  run (callback) {
    if (this[kDestroyed]) return

    debug('opening %o', this[kBrowser].title)

    this.once(kDestroyed, callback)

    this[kBrowser].open((err) => {
      if (this[kDestroyed]) return
      if (err) return this.destroy(err)

      if (!this[kSession]) {
        // Browser must connect within timeout. Don't put a timeout on
        // open(), because close() waits for opening to complete, so
        // we would leak resources if closing also times out.
        this[kStartTimer] = timeout.optional(() => {
          const msg = `Browser '${this[kBrowser].title}' did not connect`
          const err = new timeout.Error(msg, this[kTimeout])

          this.destroy(err)
        }, this[kTimeout])
      }

      this[kBrowser].on('error', (err) => this.destroy(err))
      this[kOffSignal] = onSignal(this[kOnSignal], this)

      this[kReady] = true
      this.emit(kReady)
    })
  }

  destroy (err) {
    if (this[kDestroyed]) return
    if (err) this[kErrors].push(err)
    if (this[kOffSignal]) this[kOffSignal]()
    if (this[kSession]) this[kSession].destroy()
    if (this[kStartTimer]) clearTimeout(this[kStartTimer])

    this[kDestroyed] = true
    this.removeAllListeners('reload')

    let called = 0

    const onclose = (err) => {
      if (called++) return
      if (err) this[kErrors].push(err)
      if (timer) clearTimeout(timer)

      if (this[kErrors].length) {
        this.emit(kDestroyed, combine(this[kErrors]))
      } else if (!this[kSession] || !this[kSession].stats.count) {
        // Indicates potential error to even run tests
        this.emit(kDestroyed, transient(new Error('Premature close')))
      } else {
        // The last session dictates the final result
        this.emit(kDestroyed, null, this[kSession].stats)
      }
    }

    const timer = timeout.optional(() => {
      const msg = `Browser '${this[kBrowser].title}' did not close`
      const err = new timeout.Error(msg, this[kTimeout])

      onclose(err)
    }, this[kTimeout])

    debug('closing %o', this[kBrowser].title)
    this[kBrowser].close(onclose)
  }

  reload () {
    if (!this[kDestroyed]) {
      debug('reload %o', this[kBrowser].title)
      this.emit('reload')
    }
  }

  createSession (callback) {
    if (this[kDestroyed]) return

    // Abort previous session if any
    if (this[kSession]) this[kSession].destroy()

    const title = this[kBrowser].title
    const session = new BrowserSession(title, this[kTimeout], this[kCwd], this[kAnnotate])

    // Keep track of current session
    this[kSession] = session

    // Once session is done, close browser if errored or not in live mode. In
    // the latter case there can only be one session per browser and context.
    osc(session, (err) => {
      if (this[kSession] !== session) {
        debug('old session of %o was closed: %O', title, err)
      } else if (err) {
        this.destroy(err)
      } else if (!this[kLive] && !this[kDestroyed]) {
        this[kBrowser].setStatus(this[kSession].stats.ok, (err) => {
          this.destroy(err)
        })
      }
    })

    // Client may connect before browser.open() completes. In that case,
    // defer starting the tests so that the order of events is consistent.
    this[kOnReady](() => {
      if (session !== this[kSession]) {
        debug('session of %o was replaced before context was ready', title)
      } else if (session.destroyed) {
        debug('session of %o was destroyed before context was ready', title)
      } else if (this[kDestroyed]) {
        debug('context of %o was destroyed before it was ready', title)
      } else {
        debug('ready %o', title)
        if (this[kStartTimer]) clearTimeout(this[kStartTimer])
        this.emit('session', session)
        callback(session)
      }
    })
  }

  [kOnReady] (fn) {
    if (this[kReady]) process.nextTick(fn)
    else this.once(kReady, fn)
  }

  // TODO: move to cli
  [kOnSignal] (name, signal) {
    const err = new Error(`Received signal ${name}`)

    Object.defineProperty(err, 'exitCode', { value: 128 + signal })
    Object.defineProperty(err, 'expected', { value: true })

    this.destroy(err)
  }
}

function onSignal (fn, thisArg) {
  const hup = fn.bind(thisArg, 'SIGHUP', 1)
  const int = fn.bind(thisArg, 'SIGINT', 2)
  const term = fn.bind(thisArg, 'SIGTERM', 15)

  process.once('SIGHUP', hup)
  process.once('SIGINT', int)
  process.once('SIGTERM', term)

  return function detach () {
    process.removeListener('SIGHUP', hup)
    process.removeListener('SIGINT', int)
    process.removeListener('SIGTERM', term)
  }
}
