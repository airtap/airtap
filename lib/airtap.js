'use strict'

const parallel = require('run-parallel-settled')
const Collection = require('nanoresource-collection')
const combine = require('maybe-combine-errors')
const uuid = require('uuid').v4
const Multi = require('airtap-multi')
const path = require('path')
const debug = require('debug')('airtap')
const Test = require('./test')
const BrowserContext = require('./browser-context')
const ContentServer = require('./content-server')
const SupportServer = require('./support-server')
const MessageServer = require('./message-server')
const ProxyServer = require('./proxy-server')
const Tunnels = require('./tunnels')
const cc = require('./coverage')

const kMulti = Symbol('kMulti')

module.exports = class Airtap {
  constructor () {
    this[kMulti] = new Multi()
  }

  provider (...args) {
    this[kMulti].add(...args)
  }

  manifests (...args) {
    return this[kMulti].manifests(...args)
  }

  test (manifests, files, config) {
    const cwd = path.resolve(config.cwd || '.')
    const annotate = 'annotate' in config ? config.annotate : manifests.length > 1
    const { watchify, browserify, coverage, live, timeout, loopback, tunnel } = config

    cc.clean(cwd)

    // Create servers
    const contentOptions = { cwd, watchify, browserify, coverage, live }
    const contentServer = new ContentServer(files, contentOptions)
    const messageServer = new MessageServer()
    const supportServer = config.server && new SupportServer(config.server)
    const tunnels = tunnel !== false && new Tunnels(this[kMulti], manifests, loopback)

    // Group into collection that is opened and closed as one
    const resources = [contentServer, messageServer, supportServer, tunnels]
    const collection = new Collection(resources.filter(Boolean))
    const test = new Test()

    collection.open((err) => {
      if (err) return test.destroy(err)

      // Put servers behind a per-browser proxy to avoid CORS restrictions
      // and to route client messages to the corresponding context (below).
      const contentPort = contentServer.port
      const messagePort = messageServer.port
      const supportPort = supportServer ? supportServer.port : null
      const proxyOptions = { loopback, contentPort, messagePort, supportPort }

      const tasks = manifests.map(manifest => next => {
        const cid = uuid()
        const proxyServer = new ProxyServer(manifest, cid, proxyOptions)

        proxyServer.open((err) => {
          if (err) return next(err)

          const target = { url: proxyServer.url }
          const browser = this[kMulti].browser(manifest, target)
          const context = new BrowserContext(browser, { cwd, live, timeout, annotate })
          const reload = context.reload.bind(context)

          messageServer.register(cid, context)
          test.emit('context', context)
          contentServer.on('update', reload)

          // Open browser and run tests
          context.run(function (runErr, stats) {
            if (!runErr) test.aggregate(stats)

            contentServer.removeListener('update', reload)
            messageServer.deregister(cid)
            proxyServer.close(onclose)

            function onclose (closeErr) {
              next(combine([runErr, closeErr]))
            }
          })
        })
      })

      // Retry on transient errors
      // TODO: don't retry if we already saw failed tests
      const retries = config.retries != null ? parseInt(config.retries, 10) : 6
      const withRetry = tasks.map(t => next => { retry(t, retries, next) })

      // Test browsers concurrently if all of them support it
      const concurrent = manifests.every(m => m.supports.concurrency !== false)
      const concurrency = concurrent ? parseInt(config.concurrency || 5, 10) : 1

      parallel(withRetry, concurrency, function (runErr) {
        debug('closing')
        collection.close(function (closeErr) {
          if (runErr || closeErr) {
            test.destroy(combine([runErr, closeErr]))
          } else {
            test.complete()
          }
        })
      })
    })

    return test
  }
}

function retry (task, retries, callback) {
  task(function (err, ...rest) {
    if (err && err.transient && retries > 0) {
      console.error('Retrying due to', err)

      return setTimeout(function () {
        retry(task, retries - 1, callback)
      }, 1e3)
    }

    callback(err, ...rest)
  })
}
