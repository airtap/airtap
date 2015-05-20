var assert = require('assert');

// test ensures browserify configuration is applied in order
// https://github.com/defunctzombie/zuul/issues/177
// entry file in this test starts off as:
//     console.log('foo');
// if the configuration is applied in order, the result will be:
//     console.log('qux');
// if not, it will likely be
//     console.log('bar');
test('browserify builder', function(done) {
    var builderBrowserify = require('../../lib/builder-browserify');

    var config = {
        browserify: [
            {transform: __dirname + '/../fixtures/builder-browserify/foo-to-bar-transform'},
            {plugin: __dirname + '/../fixtures/builder-browserify/bar-to-baz-plugin'},
            {transform: __dirname + '/../fixtures/builder-browserify/baz-to-qux-transform'}
        ]
    };
    var files = [__dirname + '/../fixtures/builder-browserify/entry.js'];
    var builder = builderBrowserify(files, config);

    builder(function(_, src) {
        assert.ok(src.indexOf("console.log('qux');") !== -1);
        done();
    });
});
