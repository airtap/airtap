var wd = require('wd');
var EventEmitter = require('events').EventEmitter;
var FirefoxProfile = require('firefox-profile');
var debug = require('debug')('zuul:saucebrowser');
var xtend = require('xtend');

var setup_test_instance = require('./setup');

function SauceBrowser(conf, opt) {
    if (!(this instanceof SauceBrowser)) {
        return new SauceBrowser(conf, opt);
    }

    var self = this;
    self._conf = conf;
    self._opt = opt;
    self._opt.tunnel = !opt.sauce_connect;
    self.stats = {
        passed: 0,
        failed: 0
    };
}

SauceBrowser.prototype.__proto__ = EventEmitter.prototype;

SauceBrowser.prototype.toString = function() {
    var self = this;
    var conf = self._conf;
    return '<' + conf.browser + ' ' + conf.version + ' on ' + conf.platform + '>';
};

SauceBrowser.prototype.start = function() {
    var self = this;
    var conf = self._conf;

    self.stopped = false;
    self.stats = {
        passed: 0,
        failed: 0
    };

    debug('running %s %s %s', conf.browser, conf.version, conf.platform);
    var browser = self.browser = wd.remote('ondemand.saucelabs.com', 80, conf.username, conf.key);

    browser.configureHttp({
        timeout: undefined,
        retries: 1,
        retryDelay: 1000
    });

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
            return self.shutdown(err);
        }

        self.emit('init', conf);

        var init_conf = xtend({
            build: conf.build,
            name: conf.name,
            tags: conf.tags || [],
            browserName: conf.browser,
            version: conf.version,
            platform: conf.platform
        }, conf.capabilities);

        // configures sauce connect with a tunnel identifier
        // if sauce_connect is true, use the TRAVIS_JOB_NUMBER environment variable
        // otherwise use the contents of the sauce_connect variable
        if (self._opt.sauce_connect) {
            var tunnelId = self._opt.sauce_connect !== true ? self._opt.sauce_connect : process.env.TRAVIS_JOB_NUMBER;
            if (tunnelId) {
                init_conf['tunnel-identifier'] = tunnelId;
            }
        }

        if (conf.firefox_profile) {
            var fp = new FirefoxProfile();
            var extensions = conf.firefox_profile.extensions;
            for (var preference in conf.firefox_profile) {
                if (preference !== 'extensions') {
                    fp.setPreference(preference, conf.firefox_profile[preference]);
                }
            }
            extensions = extensions ? extensions : [];
            fp.addExtensions(extensions, function () {
                fp.encoded(function(zippedProfile) {
                    init_conf.firefox_profile = zippedProfile;
                    init();
                });
            });
        } else {
            init();
        }

        function init() {
            debug('queuing %s %s %s', conf.browser, conf.version, conf.platform);

            browser.init(init_conf, function(err) {
                if (err) {
                    if (err.data) {
                        err.message += ': ' + err.data.split('\n').slice(0, 1);
                    }
                    return self.shutdown(err);
                }

                var reporter = new EventEmitter();

                reporter.on('test_end', function(test) {
                    if (!test.passed) {
                        return self.stats.failed++;
                    }
                    self.stats.passed++;
                });

                reporter.on('done', function(results) {
                    debug('done %s %s %s', conf.browser, conf.version, conf.platform);
                    var passed = results.passed;
                    var called = false;
                    browser.sauceJobStatus(passed, function(err) {
                        if (called) {
                            return;
                        }

                        called = true;
                        self.shutdown();

                        if (err) {
                            return;
                            // don't let this error fail us
                        }

                        browser.quit(function(err) {
                            // browser quit error doesn't matter
                        });
                    });

                    reporter.removeAllListeners();
                });

                debug('open %s', url);
                self.emit('start', reporter);

                var timeout = false;
                var get_timeout = setTimeout(function() {
                    debug('timed out waiting for open %s', url);
                    timeout = true;
                    self.shutdown(new Error('Timeout opening url'));
                }, 60 * 1000);

                browser.get(url, function(err) {
                    if (timeout) {
                        return;
                    }

                    clearTimeout(get_timeout);
                    if (err) {
                        return self.shutdown(err);
                    }

                    (function wait() {
                        if (self.stopped) {
                            return;
                        }

                        debug('waiting for test results from %s', url);
                        var js = '(window.zuul_msg_bus ? window.zuul_msg_bus.splice(0, 10) : []);'
                        browser.eval(js, function(err, res) {
                            if (err) {
                                debug('err: %s', err.message);
                            }

                            debug('res.length: %s', res.length);

                            if (err) {
                                return self.shutdown(err);
                            }

                            var has_done = false;
                            res = res || [];
                            res.filter(Boolean).forEach(function(msg) {
                                if (msg.type === 'done') {
                                    has_done = true;
                                }

                                reporter.emit(msg.type, msg);
                            });

                            if (has_done) {
                                debug('finished tests for %s', url);
                                return;
                            }

                            debug('fetching more results');
                            setTimeout(wait, 1000);
                        });
                    })();
                });
            });
        }
    });
};

SauceBrowser.prototype.shutdown = function(err) {
    var self = this;

    self.stopped = true;
    debug('shutdown');

    if (self.browser) {
        self.browser.quit();
    }

    if (self.controller) {
        self.controller.shutdown();
    }

    if (err) {
        self.emit('error', err);
        return;
    }

    self.emit('done', self.stats);
    self.removeAllListeners();
};

module.exports = SauceBrowser;
