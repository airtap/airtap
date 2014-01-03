var spawn = require('child_process').spawn;
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Split = require('char-split');
var debug = require('debug')('zuul:phantombrowser');

var setup_test_instance = require('./setup');

function PhantomBrowser(opt) {
    if (!(this instanceof PhantomBrowser)) {
        return new PhantomBrowser(opt);
    };

    var self = this;
    self._opt = opt;
    self.status = {
        passed: 0,
        failed: 0
    };
};

PhantomBrowser.prototype.__proto__ = EventEmitter.prototype;

PhantomBrowser.prototype.start = function() {
    var self = this;

    var phantomjs = require('phantomjs');
    var binpath = phantomjs.path;

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
            self.emit('error', err);
            self.emit('done', {
                passed: false
            });
        }

        debug('url %s', url);

        self.emit('init', url);

        var args = [path.join(__dirname, 'phantom-run.js'), url];

        var cp = spawn(binpath, args);

        var split = Split();
        split.on('data', function(line) {
            var msg;
            try {
                msg = JSON.parse(line);
            } catch (err) {
                console.log('failed to parse:', line);
                return;
            }

            var fn = self['_' + msg.type];
            if (!fn) {
                console.log('unknown line:', line);
                return;
            }
            debug('msg: %j', msg);
            fn.call(self, msg);
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

PhantomBrowser.prototype._console = function(msg) {
    console.log(msg.msg);
};

PhantomBrowser.prototype._test = function(msg) {
    var self = this;
    console.log('starting', msg.name.white);
};

PhantomBrowser.prototype._test_end = function(msg) {
    var self = this;
    if (!msg.passed) {
        self.status.failed++;
        return console.log('failed:', msg.name.red);
    }
    self.status.passed++;
    console.log('passed:', msg.name.green);
};

PhantomBrowser.prototype._assertion = function(msg) {
    var self = this;
    console.log(msg.message.red);
    if (!msg.frames || msg.frames.length === 0) {
        if (msg.source) {
            console.log(msg.source.grey);
        }
    }

    msg.frames.forEach(function(frame) {
        console.log(('    at ' + frame.func + ' (' + frame.filename + ':' + frame.line + ')').grey)
    });
};

module.exports = PhantomBrowser;
