// test browserify plugin
// changes all instances of 'bar' to 'baz'

// changes all instances of 'bar' to 'baz'
var through = require('through2');
var barToBazTransform = function (file) {
    return through(function (buf, enc, next) {
        this.push(buf.toString('utf8').replace(/bar/g, 'baz'));
        next();
    });
};

module.exports = function (b, opts) {
    b.transform(barToBazTransform);
};
