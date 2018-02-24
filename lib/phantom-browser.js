var chalk = require('chalk')
var spawn = require('child_process').spawn
var path = require('path')
var EventEmitter = require('events').EventEmitter
var Split = require('split2')
var debug = require('debug')('airtap:phantombrowser')

var setup_test_instance = require('./setup')

function getPhantom () {
  try {
    return require('phantomjs-prebuilt')
  } catch (e1) {
    try {
      // fall back to older package
      return require('phantomjs')
    } catch (e2) {
      // warn users to install phantomjs-prebuilt if they have neither installed
      throw e1
    }
  }
}

function PhantomBrowser (opt) {
  if (!(this instanceof PhantomBrowser)) {
    return new PhantomBrowser(opt)
  }

  var self = this
  self._opt = opt
  self.status = {
    passed: 0,
    failed: 0
  }
}

PhantomBrowser.prototype.__proto__ = EventEmitter.prototype

PhantomBrowser.prototype.start = function () {
  var self = this

  var phantomjs = getPhantom()

  var binpath = phantomjs.path

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
        console.log(chalk`{gray ${ frame.func } ${ frame.filename }:${ frame.line }}`)
      })
      console.log()
    })

    reporter.on('done', function () {
      reporter.removeAllListeners()
    })

    self.emit('init', url)
    self.emit('start', reporter)

    var debugArgs = [
      self._opt.phantomRemoteDebuggerPort ? '--remote-debugger-port=' + self._opt.phantomRemoteDebuggerPort : '',
      self._opt.phantomRemoteDebuggerAutorun ? '--remote-debugger-autorun=true' : ''
    ].filter(Boolean)

    var args = debugArgs.concat([path.join(__dirname, 'phantom-run.js'), url])
    var cp = spawn(binpath, args)

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

      if (msg.type === 'exception') {
        self.emit('error', new Error(msg.message))
      } else {
        reporter.emit(msg.type, msg)
      }
    })

    cp.stdout.setEncoding('utf8')
    cp.stdout.pipe(split)

    cp.stderr.on('data', function (data) {
      console.log(chalk`phantom stderr: {red ${ data }}`)
    })

    cp.on('close', function (code) {
      self.shutdown()
    })
  })
}

// TODO refactor this
PhantomBrowser.prototype.shutdown = function (err) {
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

module.exports = PhantomBrowser
