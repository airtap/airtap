var assert = require('assert');
var after = require('after');

var auth = require('./auth');
var Zuul = require('../');
var scout_browser = require('../lib/scout_browser');

test('mocha-bdd - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'mocha-bdd',
        prj_dir: __dirname + '/mocha-bdd',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/mocha-bdd/test.js']
    };

    var zuul = Zuul(config);

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

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});

test('jasmine - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'jasmine',
        prj_dir: __dirname + '/jasmine',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/jasmine/test.js']
    };

    var zuul = Zuul(config);

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

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});

test('mocha-qunit - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/mocha-qunit/test.js']
    };
    var zuul = Zuul(config);

    zuul.on('browser', function(browser) {
        browser.once('start', function(reporter) {
            reporter.once('done', function(results) {
                assert.equal(results.passed, false);
                assert.equal(results.stats.passed, 1);
                assert.equal(results.stats.failed, 1);
                done();
            });
        });

        browser.on('done', function(results) {
            assert.equal(results.passed, 1);
            assert.equal(results.failed, 1);
            done();
        });
    });

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});

test('mocha-qunit - sauce', function(done) {
    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        files: [__dirname + '/mocha-qunit/test.js'],
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
        done = after(total * 3 + 1, done);

        // each browser we test will emit as a browser
        zuul.on('browser', function(browser) {
            browser.on('init', function() {
                done();
            });

            browser.once('start', function(reporter) {
                reporter.on('done', function(results) {
                    assert.equal(results.passed, false);
                    assert.equal(results.stats.passed, 1);
                    assert.equal(results.stats.failed, 1);
                    done();
                });
            });

            browser.on('done', function(results) {
                assert.equal(results.passed, 1);
                assert.equal(results.failed, 1);
                done();
            });
        });

        zuul.run(function(passed) {
            assert.ok(!passed);
            done();
        });
    });
});
