var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var convert = require('convert-source-map');

module.exports = function(files, opt, cb) {
    if (typeof opt === 'function') {
        cb = opt;
        opt = {};
    }
    if (!opt) opts = {};
    opt.debug = true;

    var bundler = browserify(opt);

    files.forEach(function(file) {
        bundler.require(file, { entry: true });
    });

    bundler.bundle(function(err, buf) {
        if (err) {
            return cb(err);
        }

        var src = buf.toString();
        var srcmap = convert.fromSource(src);
        var map = undefined;
        src = convert.removeComments(src);

        if (srcmap) {
            map = srcmap.toObject();
        }

        cb(null, src, map);
    });
};
