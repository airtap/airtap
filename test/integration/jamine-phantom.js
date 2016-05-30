var Zuul = require('../../');

var after = require('after');
var assert = require('assert');

test('jasmine - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'jasmine',
        prj_dir: __dirname + '/../fixtures/jasmine',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/../fixtures/jasmine/test.js'],
        tunnel: 'ngrok'
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
