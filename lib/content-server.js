'use strict'

const express = require('express')
const compression = require('compression')
const browserify = require('browserify')
const watchify = require('watchify')
const enableDestroy = require('server-destroy')
const Nanoresource = require('nanoresource/emitter')
const debug = require('debug')('airtap:content-server')
const path = require('path')
const fs = require('fs')
const bundler = require('./bundler')
const watchifyOptions = require('./watchify-options')

const clientDir = path.resolve(__dirname, '../client')
const clientHtml = fs.readFileSync(path.join(clientDir, 'index.html'))
const kApp = Symbol('kApp')
const kServer = Symbol('kServer')
const kBundlers = Symbol('kBundlers')

module.exports = class ContentServer extends Nanoresource {
  constructor (files, options) {
    super()

    // Speed up repeated bundle() calls
    const enableWatchify = options.watchify !== false
    const wrap = (b) => enableWatchify ? watchify(b, { ignoreWatch: true }) : b
    const { cwd, coverage } = options

    // Create a bundler for the user's test files
    const testBundler = wrap(bundler(files, cwd, options.browserify, coverage))

    // Create a bundler for our airtap client
    const clientPath = path.join(clientDir, 'index.js')
    const clientOptions = { debug: true, ...watchifyOptions() }
    const clientBundler = wrap(browserify(clientPath, clientOptions))

    // Prevent errors in IE < 11; buffer is not actually used.
    clientBundler.ignore('buffer')

    // Notify clients of changes
    if (enableWatchify && options.live) {
      testBundler.on('update', () => { this.emit('update') })
    }

    this[kServer] = null
    this[kBundlers] = enableWatchify ? [testBundler, clientBundler] : []
    this[kApp] = express()
    this[kApp].use(compression())

    this[kApp].get('/airtap', function (req, res) {
      res.set('Content-Type', 'text/html')
      res.send(clientHtml)
    })

    this[kApp].get('/airtap/client.js', function (req, res) {
      res.set('Content-Type', 'application/javascript')
      res.set('Cache-Control', 'no-cache')
      clientBundler.bundle().on('error', bundleError).pipe(res)
    })

    this[kApp].get('/airtap/test.js', function (req, res) {
      res.set('Content-Type', 'application/javascript')
      res.set('Cache-Control', 'no-cache')
      testBundler.bundle().on('error', bundleError).pipe(res)
    })

    this[kApp].use('/airtap', express.static(clientDir))

    function bundleError (err) {
      console.error(err)
      if (!options.live) process.exit(1)
    }
  }

  get port () {
    return this[kServer].address().port
  }

  _open (callback) {
    this[kServer] = this[kApp].listen(0, () => {
      debug('active on port %o', this.port)
      callback()
    })

    enableDestroy(this[kServer])
  }

  _close (callback) {
    // Terminate connections and close server
    this[kServer].destroy((err) => {
      // Stop watching
      for (const bundler of this[kBundlers]) {
        bundler.close()
      }

      callback(err)
    })
  }
}
