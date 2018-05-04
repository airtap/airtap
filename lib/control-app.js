var path = require('path')
var fs = require('fs')
var deglob = require('globs-to-files')

var compression = require('compression')
var express = require('express')
var expstate = require('express-state')
var browserify = require('browserify')
var im = require('istanbul-middleware')
var watchify = require('watchify')
var assign = require('lodash').assign
var humanizeDuration = require('humanize-duration')
var enableDestroy = require('server-destroy')
var debug = require('debug')('airtap:control-app')

var defaultBuilder = '../lib/builder-browserify'

module.exports = function (config, cb) {
  var files = config.files
  var projectDir = config.prj_dir

  var opt = {
    debug: true
  }

  // watchify options
  // https://github.com/substack/watchify#var-w--watchifyb-opts
  opt = assign(opt, {
    cache: {},
    packageCache: {},
    fullPaths: true
  })

  files = deglob.sync(files, {cwd: projectDir})

  var userHtml = ''
  if (config.html) {
    userHtml = fs.readFileSync(path.join(projectDir, config.html), 'utf-8')
  }

  // default builder is browserify which we provide
  config.builder = config.builder || defaultBuilder

  var build = require(config.builder)(files, config)

  var app = express()
  app.use(compression())

  expstate.extend(app)

  app.set('state namespace', 'zuul')
  app.expose(config.name, 'title')

  var clientDir = path.resolve(__dirname, '../client')
  app.set('views', clientDir)
  app.set('view engine', 'html')
  app.engine('html', require('hbs').__express)

  app.use(function (req, res, next) {
    res.locals.title = config.name
    res.locals.user_scripts = config.scripts || []
    res.locals.user_html = userHtml
    next()
  })

  app.get('/airtap', function (req, res) {
    res.locals.config = { port: config.support_port }
    res.render('index')
  })

  var router = new express.Router()
  app.use(router)

  // airtap files
  app.use('/airtap', express.static(clientDir))

  // any user's files
  app.use(express.static(process.cwd()))

  if (config.coverage && config.local) {
    // coverage endpoint
    app.use('/airtap/coverage', im.createHandler())
  }

  var map
  var tape = path.resolve(__dirname, '../client/tape.js')
  var clientBundler = browserify(tape, opt)

  // we use watchify to speed up `.bundle()` calls
  clientBundler = watchify(clientBundler)

  router.get('/airtap/client.js', function (req, res, next) {
    res.contentType('application/javascript')

    var start = Date.now()
    clientBundler.bundle(function (err, buf) {
      if (err) {
        return next(err)
      }

      debug('zuul client took %s to bundle', humanizeDuration(Date.now() - start))

      res.send(buf.toString())
    })
  })

  router.get('/airtap/test-bundle.map.json', function (req, res, next) {
    if (!map) {
      return res.status(404).send('')
    }

    res.json(map)
  })

  router.get('/airtap/test-bundle.js', function (req, res, next) {
    res.contentType('application/javascript')

    build(function (err, src, srcmap) {
      if (err) {
        return next(err)
      }

      if (srcmap) {
        map = srcmap
        map.file = '/airtap/test-bundle.js'
        src += '//# sourceMappingURL=/airtap/test-bundle.map.json'
      }

      res.send(src)
    })
  })

  var server = app.listen(0, function () {
    var port = server.address().port
    function close (cb) {
      // Terminate connections and close server
      server.destroy(function (err) {
        build.close()
        clientBundler.close()
        cb(err)
      })
    }
    cb(null, { port, close })
  })

  enableDestroy(server)
}
