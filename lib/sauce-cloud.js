
// mocha-cloud inspired saucelabs runner - MIT licensed

var Emitter = require('events').EventEmitter;
var debug = require('debug')('zuul:sauce');
var Batch = require('batch');
var wd = require('wd');

module.exports = Cloud;

/**
 * Initialize a cloud test with
 * project `name`, your saucelabs username / key.
 *
 * @param {String} name
 * @param {String} user
 * @param {String} key
 * @api public
 */

function Cloud(name, user, key) {
  this.name = name;
  this.user = user;
  this.key = key;
  this.browsers = [];
  this._url = undefined;
  this._tags = [];
  this._build = undefined;
  this._concurrency = 0; // unlimited
}

Cloud.prototype.__proto__ = Emitter.prototype;

/**
 * Set tags to `tags`.
 *
 * @param {Array} tags
 * @return {Cloud} self
 * @api public
 */

Cloud.prototype.tags = function(tags){
  this._tags = tags;
  return this;
};

/**
 * Set test `url`.
 *
 * @param {String} url
 * @api public
 */

Cloud.prototype.url = function(url){
  this._url = url;
  return this;
};

/**
 * Set build id for test
 * https://saucelabs.com/docs/additional-config#build
 *
 * @param {String} build_id
 * @api public
 */

Cloud.prototype.build = function(build_id) {
  this._build = build_id;
  return this;
};

/**
 * Set concurrency for batch runs. Concurrency limits
 * https://saucelabs.com/docs/additional-config#build
 *
 * @param {Number} num number of simultaneous requests to allow
 * @api public
 */

Cloud.prototype.concurrency = function(num) {
  this._concurrency = num;
};

/**
 * Add browser for testing.
 *
 * View https://saucelabs.com/docs/browsers for details.
 *
 * @param {String} name
 * @param {String} version
 * @param {String} platform
 * @return {Cloud} self
 * @api public
 */

Cloud.prototype.browser = function(name, version, platform){
  debug('add %s %s %s', name, version, platform);
  this.browsers.push({
    browserName: name,
    version: version,
    platform: platform
  });
};

/**
 * Start cloud tests and invoke `fn(err, results)`.
 *
 * Emits:
 *
 *   - `init` (browser) testing initiated
 *   - `start` (browser) testing started
 *   - `end` (browser, results) test results complete
 *
 * @param {Function} fn
 * @api public
 */

Cloud.prototype.start = function(fn){
  var self = this;
  var batch = new Batch;
  fn = fn || function(){};

  if (!self._url) {
    return fn(new Error('url required to run sauce'));
  }

  if (self._concurrency) {
    batch.concurrency(self._concurrency);
  }

  this.browsers.forEach(function(conf){
    conf.tags = self._tags;
    conf.name = self.name;
    conf.build = self._build;

    batch.push(function(done){
      debug('running %s %s %s', conf.browserName, conf.version, conf.platform);
      var browser = wd.remote('ondemand.saucelabs.com', 80, self.user, self.key);
      self.emit('init', conf);

      browser.init(conf, function(err) {
        if (err) {
          return done(err);
        }

        debug('open %s', self._url);
        self.emit('start', conf);

        browser.get(self._url, function(err){
          if (err) return done(err);

          function wait() {
            browser.eval('window.zuul_results', function(err, res) {
              if (err) return done(err);

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
          }

          wait();
        });
      });
    });
  });

  batch.end(fn);
};
