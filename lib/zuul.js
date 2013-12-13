var format = require('util').format;
var debug = require('debug')('zuul');
var bouncy = require('bouncy');
var colors = require('colors');

var tunnel = require('./tunnel');
var Cloud = require('./sauce-cloud');
var control_app = require('./control-app');
var user_server = require('./user-server');
var expand_browsers = require('./browsers.js');

var frameworks = require('../frameworks');

module.exports = function(config) {
    var ui = config.ui;

    var ui_map = {
        'mocha-bdd': 'mocha',
        'mocha-qunit': 'mocha',
        'mocha-tdd': 'mocha'
    };

    ui = ui_map[ui] || ui;

    var framework = frameworks[ui];
    if (!framework) {
        throw new Error('unsupported ui: ' + ui);
    }

    config.framework = framework;

    var control_server = control_app(config).listen(0, function() {
        debug('control server active on port %d', control_server.address().port);
    });

    // load framework based on selected ui
    // TODO(shtylman) make this pluggable

    // TODO custom server provided by user
    var custom_server = undefined;

    if (config.server) {
        custom_server = user_server(config.server);
    }

    var bouncer_port = 0;
    if (config.local && parseInt(config.local)) {
        bouncer_port = config.local;
    }

    var bouncer = bouncy(function (req, res, bounce) {
        var url = req.url.split('?')[0];
        if (!custom_server || url.split('/')[1] === '__zuul') {
            bounce(control_server.address().port, { headers: { connection: 'close' }});
            return;
        }

        bounce(custom_server.port, { headers: { connection: 'close' }});
    });

    bouncer.listen(bouncer_port, bouncer_active);

    function bouncer_active() {
        var app_port = bouncer.address().port;
        debug('bouncer active on port %d', app_port);

        // don't start any tunnel things
        if (config.local) {

            // no localtunnel requested
            if (!config.tunnel) {
                var url = 'http://localhost:' + app_port + '/__zuul';
                console.log('open the following url in a browser:');
                console.log(url);
                return;
            }

            tunnel(app_port, function(err, url) {
                if (err) {
                    return console.error(err.stack);
                }

                url = url + '/__zuul';
                console.log('open the following url in a browser:');
                console.log(url);
            });

            return;
        }

        // config the cloud based
        var cloud = new Cloud(config.name, config.username, config.key);

        // TODO(shtylman) make configurable? detect automatically?
        cloud.concurrency(3);
        cloud.build(process.env.TRAVIS_BUILD_NUMBER);

        expand_browsers(config.browsers || [], function(err, browsers) {
            if (err) {
                console.error(err.stack);
                return;
            }

            var by_os = {};
            browsers.forEach(function(browser) {
                cloud.browser(browser.name, browser.version, browser.platform);
                var key = browser.name + ' @ ' + browser.platform;
                (by_os[key] = by_os[key] || []).push(browser.version);
            });

            for (var item in by_os) {
                console.log('  - testing: %s: %s'.grey, item, by_os[item].join(' '));
            }

            // ask localtunnel for a tunnel so we can test on sauce
            var tunnel_client = tunnel(app_port, function(err, url) {
                if (err) {
                    return console.error(err.stack);
                }

                var url = url + '/__zuul';
                var have_failed = false;

                debug('tunnel url %s', url);

                cloud.on('init', function(browser) {
                    console.log('  - queuing: %s'.white, browser_to_s(browser));
                });

                cloud.on('start', function(browser) {
                    console.log('  - starting: %s'.yellow, browser_to_s(browser));
                });

                cloud.on('end', function(browser, res) {
                    var passed = res.passed;
                    have_failed = have_failed || !res.passed;

                    if (passed) {
                        console.log('  - passed: %s'.green, browser_to_s(browser));
                        return;
                    }
                    console.log('  - failed: %s: %d failures'.red, browser_to_s(browser), res.failures);
                });

                cloud.on('error', function(err) {
                    console.error('%s'.red, err.message);
                });

                cloud.url(url);
                cloud.start(function(err) {
                    if (err) {
                        console.error('cloud failure: %s'.red, err.message);
                        return process.exit(1);
                    }

                    if (have_failed) {
                        console.log('  - tests failed'.red);
                    }
                    else {
                        console.log('  - all passed'.green);
                    }
                    setTimeout(process.exit.bind(process), 1000, (have_failed) ? 1 : 0);
                });
            });
        });
    };
};

// return a nice string for the browser
// browser v# (platform)
function browser_to_s(browser) {
    return format('%s v%s (%s)', browser.browserName, browser.version, browser.platform);
}
