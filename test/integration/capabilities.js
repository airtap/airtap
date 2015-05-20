var Zuul = require('../../');

var assert = require('assert');

test('capabilities config', function(done) {
    var config = {
        ui: 'mocha-bdd',
        capabilities: {
            'custom-data': {
                public: 'private'
            }
        }
    };

    var zuul = Zuul(config);

    zuul.browser({
        name: 'chrome',
        version: 'beta',
        platform: 'Windows 2012 R2'
    });

    var browser = zuul._browsers[0];

    browser.on('init', function(browserConfig){
        assert.ok(browserConfig.capabilities);
        assert.equal(browserConfig.capabilities['custom-data'].public, 'private');
        browser.shutdown();
    });

    browser.on('done', function(/*stats*/) {
        done();
    });

    browser.on('error', done);

    browser.start();
});
