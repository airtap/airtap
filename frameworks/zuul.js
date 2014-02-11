'use strict';

// TODO(shtylman)
// we can do something good with this
// cause we have the mappings file
// we can actually show where in the source this is!!
// before we boot anything we should install this to get reasonable debugging
window.onerror = function(msg, file, line) {
    //var item = document.createTextNode(msg + ':' + file + ':' + line);
    //document.body.appendChild(item);
}

global.JSON = global.JSON || require('JSON2');

var load = require('load-script');
var stacktrace = require('stacktrace-js');
var ajax = require('superagent');
var render_stacktrace = require('./render-stacktrace');

try {
    var stack_mapper = require('stack-mapper');
} catch (err) {}

// post messages here to send back to clients
var zuul_msg_bus = window.zuul_msg_bus = [];

// shim console.log so we can report back to user
if (typeof console === 'undefined') {
  console = {};
}

var originalLog = console.log;
console.log = function (msg) {
    var args = [].slice.call(arguments);

    zuul_msg_bus.push({
        type: 'console',
        args: args
    });

    if (typeof originalLog === 'function') {
        return originalLog.apply(this, arguments);
    }
    // old ghetto ass IE doesn't report typeof correctly
    // so we just have to call log
    else if (originalLog) {
      return originalLog(arguments[0]);
    }
};

var ZuulReporter = function(run_fn) {
    if (!(this instanceof ZuulReporter)) {
        return new ZuulReporter(run_fn);
    }

    var self = this;
    self.run_fn = run_fn;
    self.stats = {
        passed: 0,
        failed: 0
    };

    var main_div = document.getElementById('zuul');

    var header = self.header = document.createElement('div');
    header.className = 'heading pending';
    /*global zuul */
    header.innerHTML = zuul.title;
    main_div.appendChild(header);

    self.status = header.appendChild(document.createElement('div'));
    self.status.className = 'status';

    self._set_status(self.stats);

    var sub = document.createElement('div');
    sub.className = 'sub-heading';
    sub.innerHTML = navigator.userAgent;
    main_div.appendChild(sub);

    // status info
    var status = document.createElement('div');

    self._current_container = document.body.appendChild(main_div);

    self._mapper = undefined;

    // load test bundle and trigger tests to start
    // this is a problem for auto starting tests like tape
    // we need map file first
    // load map file first then test bundle
    load('/__zuul/test-bundle.js', load_map);

    function load_map(err) {
        if (err) {
            self.done(err);
        }

        if (!stack_mapper) {
            return self.start();
        }

        var map_path = '/__zuul/test-bundle.map.json';
        ajax.get(map_path).end(function(err, res) {
            if (err) {
                // ignore map load error
                return self.start();
            }

            self._source_map = res.body;
            try {
                self._mapper = stack_mapper(res.body);
            } catch (err) {}

            self.start();
        });
    }
};

ZuulReporter.prototype._set_status = function(info) {
    var self = this;
    var html = '';
    html += '<span>' + info.failed + ' <small>failing</small></span> ';
    html += '<span>' + info.passed + ' <small>passing</small></span>';
    self.status.innerHTML = html;
};

// tests are starting
ZuulReporter.prototype.start = function() {
    var self = this;
    self.run_fn();
};

// all tests done
ZuulReporter.prototype.done = function(err) {
    var self = this;

    var stats = self.stats;
    var passed = stats.failed === 0 && stats.passed > 0;

    if (passed) {
        self.header.className += ' passed';
    }
    else {
        self.header.className += ' failed';
    }

    post_message({
        type: 'done',
        stats: stats,
        passed: passed
    });
};

// new test starting
ZuulReporter.prototype.test = function(test) {
    var self = this;

    var container = document.createElement('div');
    container.className = 'test pending';

    var header = container.appendChild(document.createElement('h1'));
    header.innerHTML = test.name;

    self._current_container = self._current_container.appendChild(container);

    post_message({
        type: 'test',
        name: test.name
    });
};

// test ended
ZuulReporter.prototype.test_end = function(test) {
    var self = this;
    var name = test.name;

    var cls = test.passed ? 'passed' : 'failed';

    if (test.passed) {
        self.stats.passed++;
    }
    else {
        self.stats.failed++;
    }

    // current test element
    self._current_container.className += ' ' + cls;
    // use parentNode for legacy browsers (firefox)
    self._current_container = self._current_container.parentNode;

    self._set_status(self.stats);

    post_message({
        type: 'test_end',
        name: test.name,
        passed: test.passed
    });
};

// new suite starting
ZuulReporter.prototype.suite = function(suite) {
    var self = this;
};

// suite ended
ZuulReporter.prototype.suite_end = function(suite) {
    var self = this;
};

// assertion within test
ZuulReporter.prototype.assertion = function(details) {
    var self = this;
    // result (true | false)
    // actual
    // expected
    // message
    // error
    // source (stack) if available

    var passed = details.result;

    if (passed) {
        return;
    }

    if (details.message) {
        var pre = document.createElement('pre');
        pre.innerHTML = details.message;
        self._current_container.appendChild(pre);
    }

    // TODO actual, expected

    var message = details.message;
    var error = details.error;
    var stack = details.source;

    if (!stack && error) {
        // rethrow to try and get the stack
        // IE needs this (of course)
        try {
            throw error;
        } catch (ex) {
            error = ex;
            stack = error.stack;
        }
    }

    var frames = [];
    try {
        frames = stacktrace(error);
    } catch (err) {}

    self._renderError(stack, frames, message, error);

    post_message({
        type: 'assertion',
        actual: details.actual,
        expected: details.expected,
        message: details.message,
        source: details.source,
        frames: frames
    });
};

ZuulReporter.prototype._renderError = function (stack, frames, message, error) {
    var self = this;
    var mapper = self._mapper;
    var str;

    if (mapper && frames.length) {
        var mapped = mapper.map(frames);
        str = render_stacktrace(mapped, self._source_map);
    }

    var div = document.createElement('div');
    div.innerHTML = str ? str : (stack || message || error.toString());
    self._current_container.appendChild(div);
};

function plainString (mapped) {
    var str = '';
    for (var i = 0; i <mapped.length; ++i) {
        var frame = mapped[i];
        str += '\n\tat ';
        str += frame.func + ' (' + frame.filename + ':' + frame.line + ':';
        str += (frame.column || 0) + ')';
    }
}

function post_message(msg) {
    zuul_msg_bus.push(msg);
}

module.exports = ZuulReporter;
