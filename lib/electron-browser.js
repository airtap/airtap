var chalk = require('chalk')
var spawn = require('child_process').spawn
var path = require('path')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var Split = require('split2')
var debug = require('debug')
var createTestServer = require('./setup')
var AbstractBrowser = require('./abstract-browser')

function Electron (opt) {
  if (!(this instanceof Electron)) {
    return new Electron(opt)
  }

  AbstractBrowser.call(this)

  // Lazily require electron because it is an optional dependency.
  this._bin = require('electron')
  this._version = require('electron/package.json').version
  this.debug = debug(`airtap:electron:${this._version}`)

  // TODO refactor this into AbstractBrowser?
  this._opt = opt
}

inherits(Electron, AbstractBrowser)

Electron.prototype._start = function () {
  var self = this

  self.controller = createTestServer(self._opt, function (err, url) {
    if (err) {
      return self.shutdown(err)
    }

    self.debug('url %s', url)

    var reporter = new EventEmitter()

    reporter.on('console', function (msg) {
      console.log.apply(console, msg.args)
    })

    reporter.on('test', function (test) {
      self.debug(chalk`starting {white ${test.name}}`)
    })

    reporter.on('test_end', function (test) {
      if (!test.passed) {
        self.debug(chalk`failed {red ${test.name}}`)
        return self.stats.failed++
      }

      self.debug('passed:', test.name.green)
      self.stats.passed++
    })

    reporter.on('assertion', function (assertion) {
      self.debug(chalk`{red Error: ${assertion.message}}`)
      assertion.frames.forEach(function (frame) {
        self.debug(chalk`{gray ${frame.func} ${frame.filename}:${frame.line}}`)
      })
    })

    reporter.on('done', function () {
      reporter.removeAllListeners()
    })

    self.emit('init', url)
    self.emit('start', reporter)

    var args = [path.join(__dirname, 'electron-run.js'), url]
    var cp = spawn(self._bin, args)
    var split = Split()

    split.on('data', function (line) {
      if (line === '') return

      var msg
      try {
        msg = JSON.parse(line)
      } catch (err) {
        self.emit('error', new Error('failed to parse json: ' + line))
        return
      }

      self.debug('msg: %j', msg)
      reporter.emit(msg.type, msg)
    })

    cp.stdout.setEncoding('utf8')
    cp.stdout.pipe(split)

    cp.stderr.on('data', function (data) {
      if (/INFO:CONSOLE/.test(data)) return
      self.debug(chalk`stderr: {red ${data}}`)
    })

    cp.on('close', function (code) {
      self.shutdown()
    })
  })
}

// TODO refactor this
Electron.prototype.shutdown = function (err) {
  var self = this

  function done () {
    if (err) {
      return self.emit('error', err)
    }

    self.emit('done', self.stats)
  }

  if (this.controller) {
    this.controller.shutdown(done)
  } else {
    done()
  }
}

module.exports = Electron
