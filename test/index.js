var assert = require('assert');
var after = require('after');

var auth = require('./auth');
var Zuul = require('../');

test('mocha-qunit - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        phantom: true,
        files: [__dirname + '/mocha-qunit/test.js']
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

test('mocha-qunit - sauce', function(done) {
    var incr = 0;
    var expected = 0;

    // TODO if we pre-expand then we really know how many we expect

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        browsers: [
            { name: 'chrome', version: 'oldest..latest' },
            { name: 'firefox', version: 'oldest..latest' },
            { name: 'ie', version: 'oldest..latest' },
            { name: 'safari', version: 'oldest..latest' },
            { name: 'iphone', version: 'oldest..latest' }
        ],
        files: [__dirname + '/mocha-qunit/test.js'],
        username: auth.username,
        key: auth.key
    };

    var zuul = Zuul(config);

    // each browser we test will emit as a browser
    zuul.on('browser', function(browser) {
        expected++;

        var done = after(2, function() {
            incr++;
        });

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

        // at least 5 browsers should have fully run
        assert(incr >= 5);
        assert.equal(incr, expected);

        done();
    });
});
