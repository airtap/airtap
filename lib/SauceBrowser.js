var wd = require('wd');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('zuul:saucebrowser');

var setup_test_instance = require('./setup');

function SauceBrowser(conf, opt) {
    if (!(this instanceof SauceBrowser)) {
        return new SauceBrowser(conf, opt);
    };

    var self = this;
    self._retries = 0;
    self._conf = conf;
    self._opt = opt;
    self._opt.tunnel = true;
    self.stats = {
        passed: 0,
        failed: 0
    };
};

SauceBrowser.prototype.__proto__ = EventEmitter.prototype;

SauceBrowser.prototype.toString = function() {
    var self = this;
    var conf = self._conf;
    return '<' + conf.browser + ' ' + conf.version + ' on ' + conf.platform + '>';
};

SauceBrowser.prototype.start = function() {
    var self = this;
    var conf = self._conf;

    debug('running %s %s %s', conf.browser, conf.version, conf.platform);
    var browser = self.browser = wd.remote('ondemand.saucelabs.com', 80, conf.username, conf.key);

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
            return self.shutdown(err);
        }

        self.emit('init', conf);

        var init_conf = {
            build: conf.build,
            name: conf.name,
            tags: conf.tags || [],
            browserName: conf.browser,
            version: conf.version,
            platform: conf.platform
        };

        debug('queuing %s %s %s', conf.browser, conf.version, conf.platform);

        browser.init(init_conf, function(err) {
            if (err) {
                err.message += ': ' + err.data.split('\n').slice(0, 1);
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
                var passed = results.passed;
                browser.sauceJobStatus(passed, function(err) {
                    browser.quit(function(err) {
                        self.shutdown(err);
                    });
                });

                reporter.removeAllListeners();
            });

            debug('open %s', url);
            self.emit('start', reporter);

            browser.get(url, function(err) {
                if (err) {
                    return self.shutdown(err);
                }

                (function wait() {
                    var js = '(window.zuul_msg_bus ? window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length) : []);'
                    browser.eval(js, function(err, res) {
                        if (err) {
                            return self.shutdown(err);
                        }

                        var has_done = false;
                        res = res || [];
                        res.forEach(function(msg) {
                            if (msg.type === 'done') {
                                has_done = true;
                            }

                            reporter.emit(msg.type, msg);
                        });

                        if (has_done) {
                            return;
                        }

                        debug('fetching more results');
                        setTimeout(wait, 1000);
                    });
                })();
            });
        });
    });
};

SauceBrowser.prototype.shutdown = function(err) {
    var self = this;

    if (err) {
        // if the environment can't be set up, we should retry since Zuul will
        // never try to initialize environments that don't exist
        if (self._retries < 3
                && (~err.message.indexOf('Error response status: 13')
                    || ~err.message.indexOf('The environment you requested was unavailable')
                    || (err.message == 'Not JSON response' && ~err.data.indexOf('not in progress')))) {
            self._retries++;
            return self.start();
        }
        self.emit('error', err);
    }

    self.emit('done', self.stats);

    if (self.browser) {
        self.browser.quit();
    }

    if (self.controller) {
        self.controller.shutdown();
    }

    self.removeAllListeners();
};

module.exports = SauceBrowser;
