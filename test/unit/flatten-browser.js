var assert = require('assert');

var allBrowsers = require('../fixtures/all-browsers.js');
var flattenBrowser = require('../../lib/flatten_browser');

test('flatten browser:simple', function(done) {
    var request = [
        {name: 'iphone', version: '7.0..latest'},
        {name: 'android', version: '4.1'},
        {name: 'ipad', version: '7.0..latest'}
    ];

    var expected = [
        {name: 'iphone', version: '7.0', platform: 'Mac 10.9'},
        {name: 'iphone', version: '7.1', platform: 'Mac 10.9'},
        {name: 'iphone', version: '8.0', platform: 'Mac 10.10'},
        {name: 'iphone', version: '8.1', platform: 'Mac 10.10'},
        {name: 'iphone', version: '8.2', platform: 'Mac 10.10'},
        {name: 'android', version: '4.1', platform: 'Linux'},
        {name: 'ipad', version: '7.0', platform: 'Mac 10.9'},
        {name: 'ipad', version: '7.1', platform: 'Mac 10.9'},
        {name: 'ipad', version: '8.0', platform: 'Mac 10.10'},
        {name: 'ipad', version: '8.1', platform: 'Mac 10.10'},
        {name: 'ipad', version: '8.2', platform: 'Mac 10.10'}
    ];

    assert.deepEqual(
        flattenBrowser(request, allBrowsers),
        expected,
        'We found the browsers to test'
    );

    done();
});

test('flatten browser:stable', function(done) {
    var request = [
        {name: 'chrome', version: '40..latest', platform: 'Windows 2012 R2'}
    ];

    var expected = [
        {name: 'chrome', version: '40', platform: 'Windows 2012 R2'},
        {name: 'chrome', version: '41', platform: 'Windows 2012 R2'},
        {name: 'chrome', version: '42', platform: 'Windows 2012 R2'}
    ];

    assert.deepEqual(
        flattenBrowser(request, allBrowsers),
        expected,
        'We found the browsers to test'
    );

    done();
});
