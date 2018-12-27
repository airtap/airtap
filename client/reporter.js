'use strict'

// TODO(shtylman)
// we can do something good with this
// cause we have the mappings file
// we can actually show where in the source this is!!
// before we boot anything we should install this to get reasonable debugging
window.onerror = function (msg, file, line) {
  // var item = document.createTextNode(msg + ':' + file + ':' + line);
  // document.body.appendChild(item);
}

var load = require('load-script')
var stacktrace = require('stacktrace-js')
var xhr = require('xhr')
var renderStacktrace = require('./render-stacktrace')

try {
  var stackMapper = require('stack-mapper')
} catch (err) {}

// post messages here to send back to clients
var messageBus = window.zuul_msg_bus = []

// shim console.log so we can report back to user
if (typeof console === 'undefined') {
  // TODO standard complains on this line due to modifying global console
  // disabling warning for now
  console = {} // eslint-disable-line
}

var originalLog = console.log
console.log = function (msg) {
  var args = [].slice.call(arguments)

  messageBus.push({
    type: 'console',
    args: args
  })

  if (typeof originalLog === 'function') {
    return originalLog.apply(this, arguments)
  } else if (originalLog) {
    // old ghetto ass IE doesn't report typeof correctly
    // so we just have to call log
    return originalLog(arguments[0])
  }
}

var Reporter = function () {
  if (!(this instanceof Reporter)) {
    return new Reporter()
  }

  this.stats = {
    passed: 0,
    pending: 0,
    failed: 0
  }

  var main = document.getElementById('zuul')

  var header = this.header = document.createElement('div')
  header.className = 'heading pending'
  /* global zuul */
  header.innerHTML = zuul.title
  main.appendChild(header)

  this.status = header.appendChild(document.createElement('div'))
  this.status.className = 'status'

  this._updateStatus()

  var sub = document.createElement('div')
  sub.className = 'sub-heading'
  sub.innerHTML = navigator.userAgent
  main.appendChild(sub)

  // Create div for the test results
  var testResults = document.createElement('div')
  main.appendChild(testResults)
  document.body.appendChild(main)

  this._current_container = testResults
  this._mapper = undefined

  // load test bundle and trigger tests to start
  // this is a problem for auto starting tests like tape
  // we need map file first
  // load map file first then test bundle
  //
  // TODO: wrap the bundle in a function, that we can call
  // to start the tests after loading the source map.
  var self = this

  load('/airtap/test-bundle.js', function (err) {
    if (err) {
      return self.done(err)
    }

    if (!stackMapper) {
      return
    }

    xhr({
      method: 'get',
      uri: '/airtap/test-bundle.map.json'
    }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        console.error('failed to fetch source map', err || res.statusCode)
        return
      }

      try {
        self._source_map = JSON.parse(body)
      } catch (err) {
        console.error('failed to parse source map', err)
        return
      }

      try {
        self._mapper = stackMapper(self._source_map)
      } catch (err) {
        console.error('failed to initialize stack mapper', err)
      }
    })
  })
}

Reporter.prototype._updateStatus = function () {
  var html =
    '<span>' + this.stats.failed + ' <small>failing</small></span> ' +
    '<span>' + this.stats.passed + ' <small>passing</small></span> '

  if (this.stats.pending) {
    html += '<span>' + this.stats.pending + ' <small>pending</small></span>'
  }

  this.status.innerHTML = html
}

// all tests done
Reporter.prototype.done = function (err) {
  if (err) {
    // TODO: send a message with `type: 'error'`.
    console.error(err)
  }

  var passed = !err && this.stats.failed === 0 && this.stats.passed > 0
  var stats = this.stats

  if (passed) {
    this.header.className += ' passed'
  } else {
    this.header.className += ' failed'
  }

  if (window.__coverage__) {
    xhr({
      method: 'post',
      body: JSON.stringify(window.__coverage__),
      uri: '/airtap/coverage/reports',
      headers: { 'Content-Type': 'application/json' }
    }, function (err, res) {
      if (err || res.statusCode !== 201) {
        console.error('failed to post coverage report', err || res.statusCode)
      }

      finish()
    })
  } else {
    finish()
  }

  function finish () {
    bufferMessage({
      type: 'done',
      stats: stats,
      passed: passed
    })
  }
}

// new test starting
Reporter.prototype.test = function (test) {
  var container = document.createElement('div')
  container.className = 'test pending'

  var header = container.appendChild(document.createElement('h1'))
  header.innerHTML = test.name

  this._current_container = this._current_container.appendChild(container)

  bufferMessage({
    type: 'test',
    name: test.name
  })
}

// reports on skipped tests
Reporter.prototype.skippedTest = function (test) {
  this.stats.pending++

  var container = document.createElement('div')
  container.className = 'test pending skipped'

  var header = container.appendChild(document.createElement('h1'))
  header.innerHTML = test.name

  this._current_container.appendChild(container)
  this._updateStatus()

  bufferMessage({
    type: 'test',
    name: test.name
  })
}

// test ended
Reporter.prototype.test_end = function (test) {
  if (test.passed) {
    this.stats.passed++
  } else {
    this.stats.failed++
  }

  // current test element
  this._current_container.className += test.passed ? ' passed' : ' failed'
  // use parentNode for legacy browsers (firefox)
  this._current_container = this._current_container.parentNode

  this._updateStatus()

  bufferMessage({
    type: 'test_end',
    name: test.name,
    passed: test.passed
  })
}

// assertion within test
Reporter.prototype.assertion = function (details) {
  // result (true | false)
  // actual
  // expected
  // message
  // error
  // source (stack) if available

  var passed = details.result

  if (passed) {
    return
  }

  if (details.message) {
    var pre = document.createElement('pre')
    pre.innerHTML = details.message
    this._current_container.appendChild(pre)
  }

  // TODO actual, expected

  var message = details.message
  var error = details.error
  var stack = details.source

  if (!stack && error) {
    // rethrow to try and get the stack
    // IE needs this (of course)
    try {
      throw error
    } catch (ex) {
      error = ex
      stack = error.stack
    }
  }

  var frames = []
  try {
    frames = stacktrace(error)
  } catch (err) {}

  this._renderError(stack, frames, message, error)

  bufferMessage({
    type: 'assertion',
    actual: details.actual,
    expected: details.expected,
    message: details.message,
    source: details.source,
    frames: frames
  })
}

Reporter.prototype._renderError = function (stack, frames, message, error) {
  var mapper = this._mapper
  var str

  if (mapper && frames.length) {
    var mapped = mapper.map(frames)
    str = renderStacktrace(mapped, this._source_map)
  }

  var div = document.createElement('div')
  div.innerHTML = str || (stack || message || error.toString())
  this._current_container.appendChild(div)
}

function bufferMessage (msg) {
  messageBus.push(msg)
}

module.exports = Reporter
