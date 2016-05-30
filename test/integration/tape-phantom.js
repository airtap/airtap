var Zuul = require('../../');

var after = require('after');
var assert = require('assert');

test('tape - phantom', function(done) {
    done = after(3, done);
    var consoleOutput = [];

    var config = {
        ui: 'tape',
        prj_dir: __dirname + '/../fixtures/tape',
        phantom: true,
        concurrency: 1,
        files: [__dirname + '/../fixtures/tape/test.js'],
        tunnel: 'ngrok'
    };

    var zuul = Zuul(config);

    // each browser we test will emit as a browser
    zuul.on('browser', function(browser) {
        browser.on('start', function(reporter) {
            reporter.on('console', function(msg) {
                consoleOutput.push(msg.args);
            });
        });

        browser.on('init', function() {
            done();
        });

        browser.on('done', function(results) {
            var endOfOutput = consoleOutput.slice(-5);

            // check that we did output untill the end of the test suite
            // this is the number of asserts in tape
            assert.deepEqual(endOfOutput[0], ['1..9']);
            assert.deepEqual(endOfOutput[1], ['# tests 9']);
            assert.deepEqual(endOfOutput[2], ['# pass  5']);
            assert.deepEqual(endOfOutput[3], ['# fail  4']);
            assert.deepEqual(endOfOutput[4], ['']);

            // this is the number of passed/failed test() in tape
            assert.equal(results.passed, 3);
            assert.equal(results.failed, 3);
            done();
        });
    });

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});
