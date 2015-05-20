var Zuul = require('../../');

var after = require('after');
var assert = require('assert');

var auth = require('../auth');
var scout_browser = require('../../lib/scout_browser');

test('mocha-qunit - sauce', function(done) {
    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/../fixtures/mocha-qunit',
        files: [__dirname + '/../fixtures/mocha-qunit/test.js'],
        username: auth.username,
        concurrency: 1,
        key: auth.key
    };

    var zuul = Zuul(config);

    scout_browser(function(err, browsers) {
        assert.ifError(err);

        var total = 0;
        Object.keys(browsers).forEach(function(key) {
            var list = browsers[key];
            if (list.length === 1) {
                total++;
                return zuul.browser(list);
            }

            list.sort(function(a, b) {
                return a.version - b.version;
            });

            // test latest and oldest
            total += 2;
            zuul.browser(list.shift());
            zuul.browser(list.pop());
        });

        // N times per browser and once for all done
        done = after(total * 2 + 1, done);

        // each browser we test will emit as a browser
        zuul.on('browser', function(browser) {
            browser.on('init', function() {
                done();
            });

            browser.on('done', function(results) {
                assert.equal(results.passed, 1);
                assert.equal(results.failed, 1);
                done();
            });
        });

        zuul.on('error', function(err) {
            done(err);
        });

        zuul.run(function(passed) {
            assert.ok(!passed);
            done();
        });
    });
});
