var wd = require('wd');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('zuul:saucebrowser');

var setup_test_instance = require('./setup');

function SauceBrowser(conf, opt) {
    if (!(this instanceof SauceBrowser)) {
        return new SauceBrowser(conf, opt);
    };

    var self = this;
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

            debug('open %s', url);
            self.emit('start', conf);

            browser.get(url, function(err) {
                if (err) {
                    return self.shutdown(err);
                }

                (function wait() {
                    browser.eval('window.zuul_results', function(err, res) {
                        if (err) {
                            return self.shutdown(err);
                        }

                        if (!res) {
                            debug('waiting for results');
                            setTimeout(wait, 1000);
                            return;
                        }

                        // we require that zuul_results contain a field
                        // `passed` to indicate if all tests passed
                        debug('results %j', res);
                        self.stats = {
                            failed: res.failed,
                            passed: res.passed
                        };

                        // there should have been some tests run
                        var passed = self.stats.failed === 0 && self.stats.passed > 0;
                        browser.sauceJobStatus(passed, function(err) {
                            browser.quit(function(err) {
                                self.shutdown(err);
                            });
                        });
                    });
                })();
            });
        });
    });
};

SauceBrowser.prototype.shutdown = function(err) {
    var self = this;

    if (err) {
        self.emit('error', err);
    }

    self.emit('done', self.stats);

    if (self.browser) {
        self.browser.quit();
    }

    if (self.controller) {
        self.controller.shutdown();
    }
};

module.exports = SauceBrowser;
