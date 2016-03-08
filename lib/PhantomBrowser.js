var spawn = require('child_process').spawn;
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Split = require('char-split');
var debug = require('debug')('zuul:phantombrowser');

var setup_test_instance = require('./setup');
require('colors');

function getPhantom() {
    try {
        return require('phantomjs-prebuilt');
    } catch (e1) {
        try {
            // fall back to older package
            return require('phantomjs');
        } catch (e2) {
            // warn users to install phantomjs-prebuilt if they have neither installed
            throw e1;
        }
    }
}

function PhantomBrowser(opt) {
    if (!(this instanceof PhantomBrowser)) {
        return new PhantomBrowser(opt);
    }

    var self = this;
    self._opt = opt;
    self.status = {
        passed: 0,
        failed: 0
    };
}

PhantomBrowser.prototype.__proto__ = EventEmitter.prototype;

PhantomBrowser.prototype.start = function() {
    var self = this;

    var phantomjs = getPhantom();
    
    var binpath = phantomjs.path;

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
            self.emit('error', err);
            self.emit('done', {
                passed: false
            });
        }

        debug('url %s', url);

        var reporter = new EventEmitter();

        reporter.on('console', function(msg) {
            console.log.apply(console, msg.args);
        });

        reporter.on('test', function(test) {
            console.log('starting', test.name.white);
        });

        reporter.on('test_end', function(test) {
            if (!test.passed) {
                console.log('failed', test.name.red);
                return self.status.failed++;
            }

            console.log('passed:', test.name.green);
            self.status.passed++;
        });

        reporter.on('assertion', function(assertion) {
            console.log('Error: %s'.red, assertion.message);
            assertion.frames.forEach(function(frame) {
                console.log('    %s %s:%d'.grey, frame.func, frame.filename, frame.line);
            });
            console.log();
        });

        reporter.on('done', function() {
            reporter.removeAllListeners();
        });

        self.emit('init', url);
        self.emit('start', reporter);

        var debugArgs = [
            self._opt.phantomRemoteDebuggerPort ? '--remote-debugger-port=' + self._opt.phantomRemoteDebuggerPort : '',
            self._opt.phantomRemoteDebuggerAutorun ? '--remote-debugger-autorun=true' : ''
        ].filter(Boolean);

        var args = debugArgs.concat([path.join(__dirname, 'phantom-run.js'), url]);
        var cp = spawn(binpath, args);

        var split = Split();
        split.on('data', function(line) {
            var msg;
            try {
                msg = JSON.parse(line);
            } catch (err) {
                self.emit('error', new Error('failed to parse json: ' + line));
                return;
            }

            debug('msg: %j', msg);

            if (msg.type === 'exception') {
                self.emit('error', new Error(msg.message));
            } else {
                reporter.emit(msg.type, msg);
            }
        });

        cp.stdout.setEncoding('utf8');
        cp.stdout.pipe(split);

        cp.stderr.on('data', function (data) {
            console.error('phantom stderr: '.red + data);
        });

        cp.on('close', function (code) {
            self.emit('done', {
                passed: self.status.passed,
                failed: self.status.failed
            });
        });
    });
};

PhantomBrowser.prototype.shutdown = function() {
    if (self.controller) {
        self.controller.shutdown();
    }
};

module.exports = PhantomBrowser;
