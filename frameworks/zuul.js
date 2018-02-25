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
var ajax = require('superagent')
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
  }
  // old ghetto ass IE doesn't report typeof correctly
  // so we just have to call log
  else if (originalLog) {
    return originalLog(arguments[0])
  }
}

var ZuulReporter = function (runFn) {
  if (!(this instanceof ZuulReporter)) {
    return new ZuulReporter(runFn)
  }

  var self = this
  self.runFn = runFn
  self.stats = {
    passed: 0,
    pending: 0,
    failed: 0
  }

  var main = document.getElementById('zuul')

  var header = self.header = document.createElement('div')
  header.className = 'heading pending'
  /* global zuul */
  header.innerHTML = zuul.title
  main.appendChild(header)

  self.status = header.appendChild(document.createElement('div'))
  self.status.className = 'status'

  self._set_status(self.stats)

  var sub = document.createElement('div')
  sub.className = 'sub-heading'
  sub.innerHTML = navigator.userAgent
  main.appendChild(sub)

  // Add tab selector
  var tabSelector = document.createElement('div')
  tabSelector.id = 'tab-selector'
  var resultsSelector = document.createElement('a')
  resultsSelector.className = 'selected'
  resultsSelector.href = '/__zuul'
  resultsSelector.innerHTML = 'Test results'
  resultsSelector.onclick = function (e) {
    var selectors = document.querySelectorAll('#tab-selector a')
    for (var i = 0; i < selectors.length; i++) {
      selectors[i].className = ''
    }

    e.target.className = 'selected'

    document.getElementById('test-results-tab').className = 'tab'
    document.getElementById('code-coverage-tab').className = 'tab hidden'
    e.preventDefault()
  }
  tabSelector.appendChild(resultsSelector)
  var coverageSelector = document.createElement('a')
  coverageSelector.href = '/__zuul/coverage'
  coverageSelector.innerHTML = 'Code coverage'
  coverageSelector.onclick = function (e) {
    var selectors = document.querySelectorAll('#tab-selector a')
    for (var i = 0; i < selectors.length; i++) {
      selectors[i].className = ''
    }

    e.target.className = 'selected'

    document.getElementById('test-results-tab').className = 'tab hidden'
    document.getElementById('code-coverage-tab').className = 'tab'
    e.preventDefault()
  }
  tabSelector.appendChild(coverageSelector)
  main.appendChild(tabSelector)

  // Add tabs and their content containers
  var tabs = document.createElement('div')
  tabs.className = 'tabs'
  var testResultsTab = document.createElement('div')
  testResultsTab.className = 'tab'
  testResultsTab.id = 'test-results-tab'
  tabs.appendChild(testResultsTab)
  var codeCoverageTab = document.createElement('div')
  codeCoverageTab.className = 'tab hidden'
  codeCoverageTab.id = 'code-coverage-tab'
  tabs.appendChild(codeCoverageTab)
  main.appendChild(tabs)

  document.body.appendChild(main)
  self._current_container = testResultsTab

  self._mapper = undefined

  // load test bundle and trigger tests to start
  // this is a problem for auto starting tests like tape
  // we need map file first
  // load map file first then test bundle
  load('/__zuul/test-bundle.js', onLoad)

  function onLoad (err) {
    if (err) {
      self.done(err)
    }

    if (!stackMapper) {
      return self.start()
    }

    ajax.get('/__zuul/test-bundle.map.json').end(function (err, res) {
      if (err) {
        // ignore map load error
        return self.start()
      }

      self._source_map = res.body
      try {
        self._mapper = stackMapper(res.body)
      } catch (err) {}

      self.start()
    })
  }
}

ZuulReporter.prototype._set_status = function (info) {
  var self = this
  var html = ''
  html += '<span>' + info.failed + ' <small>failing</small></span> '
  html += '<span>' + info.passed + ' <small>passing</small></span> '
  if (self.stats.pending) {
    html += '<span>' + info.pending + ' <small>pending</small></span>'
  }

  self.status.innerHTML = html
}

// tests are starting
ZuulReporter.prototype.start = function () {
  var self = this
  self.runFn()
}

// all tests done
ZuulReporter.prototype.done = function (err) {
  var self = this

  var stats = self.stats
  var passed = stats.failed === 0 && stats.passed > 0

  if (passed) {
    self.header.className += ' passed'
  } else {
    self.header.className += ' failed'
  }

  // add coverage tab content
  if (window.__coverage__) {
    var coverageTab = document.getElementById('code-coverage-tab')
    coverageTab.innerHTML = '<iframe frameborder="0" src="/__zuul/coverage"></iframe>'
  }

  postMessage({
    type: 'done',
    stats: stats,
    passed: passed
  })
}

// new test starting
ZuulReporter.prototype.test = function (test) {
  var self = this

  var container = document.createElement('div')
  container.className = 'test pending'

  var header = container.appendChild(document.createElement('h1'))
  header.innerHTML = test.name

  self._current_container = self._current_container.appendChild(container)

  postMessage({
    type: 'test',
    name: test.name
  })
}

// reports on skipped tests
ZuulReporter.prototype.skippedTest = function (test) {
  var self = this

  self.stats.pending++

  var container = document.createElement('div')
  container.className = 'test pending skipped'

  var header = container.appendChild(document.createElement('h1'))
  header.innerHTML = test.name

  self._current_container.appendChild(container)

  self._set_status(self.stats)

  postMessage({
    type: 'test',
    name: test.name
  })
}

// test ended
ZuulReporter.prototype.test_end = function (test) {
  var self = this
  var cls = test.passed ? 'passed' : 'failed'

  if (test.passed) {
    self.stats.passed++
  } else {
    self.stats.failed++
  }

  // current test element
  self._current_container.className += ' ' + cls
  // use parentNode for legacy browsers (firefox)
  self._current_container = self._current_container.parentNode

  self._set_status(self.stats)

  var cov = window.__coverage__

  if (cov) {
    ajax.post('/__zuul/coverage/client')
      .send(cov)
      .end(function (err, res) {
        if (err) {
          console.log('error in coverage reports')
          console.log(err)
        }
      })
  }

  postMessage({
    type: 'test_end',
    name: test.name,
    passed: test.passed
  })
}

// new suite starting
ZuulReporter.prototype.suite = function (suite) {}

// suite ended
ZuulReporter.prototype.suite_end = function (suite) {}

// assertion within test
ZuulReporter.prototype.assertion = function (details) {
  var self = this
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
    self._current_container.appendChild(pre)
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

  self._renderError(stack, frames, message, error)

  postMessage({
    type: 'assertion',
    actual: details.actual,
    expected: details.expected,
    message: details.message,
    source: details.source,
    frames: frames
  })
}

ZuulReporter.prototype._renderError = function (stack, frames, message, error) {
  var self = this
  var mapper = self._mapper
  var str

  if (mapper && frames.length) {
    var mapped = mapper.map(frames)
    str = renderStacktrace(mapped, self._source_map)
  }

  var div = document.createElement('div')
  div.innerHTML = str || (stack || message || error.toString())
  self._current_container.appendChild(div)
}

function postMessage (msg) {
  messageBus.push(msg)
}

module.exports = ZuulReporter
