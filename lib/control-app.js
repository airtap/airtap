'use strict'

const path = require('path')
const fs = require('fs')
const deglob = require('globs-to-files')
const compression = require('compression')
const express = require('express')
const browserify = require('browserify')
const watchify = require('watchify')
const enableDestroy = require('server-destroy')
const debug = require('debug')('airtap:control-server')
const createTestBundler = require('./builder-browserify')
const watchifyOptions = require('./watchify-options')

module.exports = function (config, callback) {
  const cwd = config.prj_dir

  // Speed up bundle() calls
  const wrap = (b) => config.watchify ? watchify(b, { ignoreWatch: true }) : b

  // Create a bundler for the user's test files
  const files = deglob.sync(config.files, { cwd })
  const testBundler = wrap(createTestBundler(files, config))

  // Create a bundler for our airtap client
  const clientDir = path.resolve(__dirname, '../client')
  const clientBundler = wrap(browserify(path.join(clientDir, 'tape.js'), {
    debug: true,
    ...watchifyOptions()
  }))

  // Prevent errors in IE < 11; buffer is not actually used.
  clientBundler.ignore('buffer')

  if (config.watchify && config.live) {
    // TODO: notify client of changes (live reload)
    // testBundler.on('update', ..)
  }

  const app = express()
  const clientHtml = fs.readFileSync(path.join(clientDir, 'index.html'))

  app.use(compression())

  app.get('/airtap', function (req, res) {
    res.set('Content-Type', 'text/html')
    res.send(clientHtml)
  })

  app.use('/airtap', express.static(clientDir))

  app.get('/airtap/client.js', function (req, res) {
    res.set('Content-Type', 'application/javascript')
    clientBundler.bundle().on('error', bundleError).pipe(res)
  })

  app.get('/airtap/test.js', function (req, res) {
    res.set('Content-Type', 'application/javascript')
    testBundler.bundle().on('error', bundleError).pipe(res)
  })

  function bundleError (err) {
    console.error(err.stack)
    if (!config.live) process.exit(1)
  }

  const server = app.listen(0, function () {
    const port = server.address().port

    function close (callback) {
      // Terminate connections and close server
      server.destroy(function (err) {
        if (config.watchify) {
          testBundler.close()
          clientBundler.close()
        }

        callback(err)
      })
    }

    debug('active on port %d', port)
    callback(null, { port, close })
  })

  enableDestroy(server)
}
