var chalk = require('chalk')
var spawn = require('child_process').spawn
var path = require('path')
var EventEmitter = require('events').EventEmitter
var Split = require('split2')
var debug = require('debug')('airtap:electron')

var setup_test_instance = require('./setup')

function Electron (opt) {
  if (!(this instanceof Electron)) {
    return new Electron(opt)
  }

  var self = this
  self._opt = opt
  self.status = {
    passed: 0,
    failed: 0
  }
}

Electron.prototype.__proto__ = EventEmitter.prototype

Electron.prototype.start = function () {
  var self = this

  var binpath
  try {
    binpath = require('electron-prebuilt')
  } catch (err) {
    binpath = require('electron')
  }

  self.controller = setup_test_instance(self._opt, function (err, url) {
    if (err) {
      return self.shutdown(err)
    }

    debug('url %s', url)

    var reporter = new EventEmitter()

    reporter.on('console', function (msg) {
      console.log.apply(console, msg.args)
    })

    reporter.on('test', function (test) {
      console.log(chalk`starting {white ${ test.name }}`)
    })

    reporter.on('test_end', function (test) {
      if (!test.passed) {
        console.log(chalk`failed {red ${ test.name }}`)
        return self.status.failed++
      }

      console.log('passed:', test.name.green)
      self.status.passed++
    })

    reporter.on('assertion', function (assertion) {
      console.log(chalk`{red Error: ${ assertion.message }}`)
      assertion.frames.forEach(function (frame) {
        console.log(chalk`{gray ${frame.func} ${ frame.filename }:${ frame.line }}`)
      })
      console.log()
    })

    reporter.on('done', function () {
      reporter.removeAllListeners()
    })

    self.emit('init', url)
    self.emit('start', reporter)

    var args = [path.join(__dirname, 'electron-run.js'), url]

    var cp = spawn(binpath, args)

    var errors = []

    var split = Split()
    split.on('data', function (line) {
      var msg
      try {
        msg = JSON.parse(line)
      } catch (err) {
        self.emit('error', new Error('failed to parse json: ' + line))
        return
      }

      debug('msg: %j', msg)
      reporter.emit(msg.type, msg)
    })

    cp.stdout.setEncoding('utf8')
    cp.stdout.pipe(split)

    cp.stderr.on('data', function (data) {
      if (/INFO:CONSOLE/.test(data)) return
      debug(chalk`Electron stderr: {red ${ data }}`)
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

    self.emit('done', {
      passed: self.status.passed,
      failed: self.status.failed
    })
  }

  if (this.controller) {
    this.controller.shutdown(done)
  } else {
    done()
  }
}

module.exports = Electron
