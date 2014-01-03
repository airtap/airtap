var debug = require('debug')('zuul');
var colors = require('colors');
var Batch = require('batch');
var EventEmitter = require('events').EventEmitter;

var control_app = require('./control-app');
var expand_browsers = require('./browsers.js');
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
                done(results.failed === 0);
            });
            return phantom.start();
        }

        // expand config string browsers into an array of browsers to test
        expand_browsers(config.browsers || [], function(err, browsers) {
            if (err) {
                self.emit('error', err);
                return done(false);
            }

            // pretty prints which browsers we will test on what platforms
            {
                var by_os = {};
                browsers.forEach(function(browser) {
                    var key = browser.name + ' @ ' + browser.platform;
                    (by_os[key] = by_os[key] || []).push(browser.version);
                });

                for (var item in by_os) {
                    console.log('  - testing: %s: %s'.grey, item, by_os[item].join(' '));
                }
            }

            browsers = browsers.map(function(info) {
                return SauceBrowser({
                    name: config.name,
                    build: process.env.TRAVIS_BUILD_NUMBER,
                    username: config.username,
                    key: config.key,
                    browser: info.name,
                    version: info.version,
                    platform: info.platform
                }, config);
            });

            var batch = new Batch();

            // TODO(shtylman) option
            batch.concurrency(3);

            var passed = true;

            browsers.forEach(function(browser) {
                self.emit('browser', browser);

                batch.push(function(done) {
                    browser.once('done', function(results) {
                        if (results.failed) {
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
    });
};
