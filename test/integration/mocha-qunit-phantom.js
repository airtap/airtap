var Zuul = require('../../');

var after = require('after');
var assert = require('assert');

test('mocha-qunit - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/../fixtures/mocha-qunit',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/../fixtures/mocha-qunit/test.js'],
        tunnel: 'ngrok'
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
