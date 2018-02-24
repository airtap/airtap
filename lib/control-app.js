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
var debug = require('debug')('airtap:control-app')

var defaultBuilder = '../lib/builder-browserify'

module.exports = function (config, cb) {
  var files = config.files
  var prj_dir = config.prj_dir

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

  files = deglob.sync(files, {cwd: prj_dir})

  var user_html = ''
  if (config.html) {
    user_html = fs.readFileSync(path.join(prj_dir, config.html), 'utf-8')
  }

  // default builder is browserify which we provide
  config.builder = config.builder || defaultBuilder

  var build = require(config.builder)(files, config)

  var app = express()
  app.use(compression())

  expstate.extend(app)

  app.set('state namespace', 'zuul')
  app.expose(config.name, 'title')

  app.set('views', __dirname + '/../frameworks')
  app.set('view engine', 'html')
  app.engine('html', require('hbs').__express)

  app.use(function (req, res, next) {
    res.locals.title = config.name
    res.locals.user_scripts = config.scripts || []
    res.locals.user_html = user_html
    next()
  })

  app.get('/__zuul', function (req, res) {
    res.locals.config = { port: config.support_port }
    res.render('index')
  })

  var bundle_router = new express.Router()
  app.use(bundle_router)

  // airtap files
  app.use('/__zuul', express.static(__dirname + '/../frameworks'))

  // any user's files
  app.use(express.static(process.cwd()))

  if (config.coverage && config.local) {
    // coverage endpoint
    app.use('/__zuul/coverage', im.createHandler())
  }

  var map
  var tape = path.resolve(__dirname, '../frameworks/tape.js')
  var clientBundler = browserify(tape, opt)

  // we use watchify to speed up `.bundle()` calls
  clientBundler = watchify(clientBundler)

  bundle_router.get('/__zuul/client.js', function (req, res, next) {
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

  bundle_router.get('/__zuul/test-bundle.map.json', function (req, res, next) {
    if (!map) {
      return res.status(404).send('')
    }

    res.json(map)
  })

  bundle_router.get('/__zuul/test-bundle.js', function (req, res, next) {
    res.contentType('application/javascript')

    build(function (err, src, srcmap) {
      if (err) {
        return next(err)
      }

      if (srcmap) {
        map = srcmap
        map.file = '/__zuul/test-bundle.js'
        src += '//# sourceMappingURL=' + '/__zuul/test-bundle.map.json'
      }

      res.send(src)
    })
  })

  var server = app.listen(0, function () {
    var port = server.address().port
    function close (cb) {
      server.close(function (err) {
        build.close()
        clientBundler.close()
        cb(err)
      })
    }
    cb(null, { port, close })
  })
}
