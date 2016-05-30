var Zuul = require('../../');

var assert = require('assert');

test('capabilities config', function(done) {
    var config = {
        ui: 'mocha-bdd',
        capabilities: {
            'custom-data': {
                public: 'private'
            }
        },
        tunnel: 'ngrok'
    };

    var zuul = Zuul(config);

    zuul.browser({
        name: 'internet explorer',
        version: '11'
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
