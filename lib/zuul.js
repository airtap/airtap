var debug = require('debug')('zuul');
var Batch = require('batch');
var EventEmitter = require('events').EventEmitter;

var control_app = require('./control-app');
var frameworks = require('../frameworks');
var setup_test_instance = require('./setup');
var SauceBrowser = require('./SauceBrowser');
var PhantomBrowser = require('./PhantomBrowser');

module.exports = Zuul;

function Zuul(config) {
    if (!(this instanceof Zuul)) {
        return new Zuul(config);
    }

    var self = this;

    var ui = config.ui;
    var framework_dir = frameworks[ui];
    if (!framework_dir) {
        throw new Error('unsupported ui: ' + ui);
    }

    config.framework_dir = framework_dir;
    self._config = config;

    // list of browsers to test
    self._browsers = [];

    self._concurrency = config.concurrency || 3;
};

Zuul.prototype.__proto__ = EventEmitter.prototype;

Zuul.prototype._setup = function(cb) {
    var self = this;

    var config = self._config;

    // we only need one control app
    var control_server = control_app(config).listen(0, function() {
        debug('control server active on port %d', control_server.address().port);
        cb(null, control_server.address().port);
    });
};

Zuul.prototype.browser = function(info) {
    var self = this;
    var config = self._config;

    self._browsers.push(SauceBrowser({
        name: config.name,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: config.username,
        key: config.key,
        browser: info.name,
        version: info.version,
        platform: info.platform
    }, config));
};

Zuul.prototype.run = function(done) {
    var self = this;

    var config = self._config;

    self._setup(function(err, control_port) {
        config.control_port = control_port;

        if (config.local) {
            setup_test_instance(config, function(err, url) {
                if (err) {
                    console.error(err.stack);
                    process.exit(1);
                    return;
                }

                console.log('open the following url in a browser:');
                console.log(url);
            });
            return;
        }

        // TODO love and care
        if (config.phantom) {
            var phantom = PhantomBrowser(config);
            self.emit('browser', phantom);
            phantom.once('done', function(results) {
                done(results.failed === 0 && results.passed > 0);
            });
            return phantom.start();
        }

        var batch = new Batch();
        batch.concurrency(self._concurrency);

        var passed = true;

        self._browsers.forEach(function(browser) {
            self.emit('browser', browser);

            batch.push(function(done) {
                browser.once('done', function(results) {
                    // if no tests passed, then this is also a problem
                    // indicates potential error to even run tests
                    if (results.failed || results.passed === 0) {
                        passed = false;
                    }
                    done();
                });
                browser.start();
            });
        });

        batch.end(function(err) {
            debug('batch done');
            done(err || passed);
        });
    });
};
