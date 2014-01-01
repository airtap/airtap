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
};

SauceBrowser.prototype.__proto__ = EventEmitter.prototype;

SauceBrowser.prototype.start = function(done) {
    var self = this;
    var conf = self._conf;

    debug('running %s %s %s', conf.browser, conf.version, conf.platform);
    var browser = self.browser = wd.remote('ondemand.saucelabs.com', 80, conf.username, conf.key);

    self.controller = setup_test_instance(self._opt, function(err, url) {
        if (err) {
            return done(err);
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
                return done(err);
            }

            debug('open %s', url);
            self.emit('start', conf);

            browser.get(url, function(err) {
                if (err) {
                    return done(err);
                }

                (function wait() {
                    browser.eval('window.zuul_results', function(err, res) {
                        if (err) {
                            return done(err);
                        }

                        if (!res) {
                            debug('waiting for results');
                            setTimeout(wait, 1000);
                            return;
                        }

                        // we require that zuul_results contain a field
                        // `passed` to indicate if all tests passed
                        debug('results %j', res);
                        self.emit('end', conf, res);
                        browser.sauceJobStatus(res.passed, function(err) {
                            browser.quit();
                            done(err, res);
                        });
                    });
                })();
            });
        });
    });
};

SauceBrowser.prototype.shutdown = function() {
    var self = this;

    if (self.browser) {
        self.browser.quit();
    }

    if (self.controller) {
        self.controller.shutdown();
    }
};

module.exports = SauceBrowser;
