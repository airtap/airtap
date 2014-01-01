var spawn = require('child_process').spawn;
var path = require('path');
var debug = require('debug')('zuul:phantombrowser');

var setup_test_instance = require('./setup');

function PhantomBrowser(opt) {
    if (!(this instanceof PhantomBrowser)) {
        return new PhantomBrowser(opt);
    };

    var self = this;
    self._opt = opt;
};

PhantomBrowser.prototype.start = function(done) {
    var self = this;

    var phantomjs = require('phantomjs');
    var binpath = phantomjs.path;

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
        }

        debug('url %s', url);

        var args = [path.join(__dirname, 'phantom-run.js'), url];

        var cp = spawn(binpath, args);

        cp.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        cp.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        cp.on('close', function (code) {
            console.log('child process exited with code ' + code);
            done();
        });
    });
};

PhantomBrowser.prototype.shutdown = function() {
    if (self.controller) {
        self.controller.shutdown();
    }
};

module.exports = PhantomBrowser;
