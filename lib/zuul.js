var debug = require('debug')('zuul');
var colors = require('colors');
var Batch = require('batch');

var control_app = require('./control-app');
var expand_browsers = require('./browsers.js');
var frameworks = require('../frameworks');
var setup_test_instance = require('./setup');
var SauceBrowser = require('./SauceBrowser');
var PhantomBrowser = require('./PhantomBrowser');

module.exports = function(config) {
    var ui = config.ui;

    var framework_dir = frameworks[ui];
    if (!framework_dir) {
        throw new Error('unsupported ui: ' + ui);
    }

    config.framework_dir = framework_dir;

    // we only need one control app
    var control_server = control_app(config).listen(0, function() {
        debug('control server active on port %d', control_server.address().port);

        config.control_port = control_server.address().port;

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
            phantom.start(function() {
                process.exit(0);
            });
            return;
        }

        // expand config string browsers into an array of browsers to test
        expand_browsers(config.browsers || [], function(err, browsers) {
            if (err) {
                console.error(err.stack);
                return;
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
            batch.concurrency(3);

            var passed = true;

            browsers.forEach(function(browser) {
                batch.push(function(done) {
                    browser.start(function(err, res) {
                        browser.shutdown();
                        if (err) {
                            console.error('browser failure: ' + err.message);
                            passed = false;
                            return done();
                        }

                        if (!res.passed) {
                            passed = false;
                        }
                        done();
                    });
                });
            });

            batch.end(function(err) {
                if (err) {
                    console.error(err.stack);
                    return process.exit(1);
                }

                if (passed) {
                    console.log('  - passed'.green);
                }
                else {
                    console.log('  - failed'.red);
                }
                process.exit(passed ? 0 : 1);
            });
        });
    });
};
