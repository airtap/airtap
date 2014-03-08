var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var convert = require('convert-source-map');

module.exports = function(files, cb) {
    var bundle_opts = { debug: true };
    var bundler = browserify();

    files.forEach(function(file) {
        bundler.require(file, { entry: true });
    });

    bundler.bundle(bundle_opts, function(err, src) {
        if (err) {
            return cb(err);
        }

        var srcmap = convert.fromSource(src);
        var map = undefined;
        src = convert.removeComments(src);

        if (srcmap) {
            map = srcmap.toObject();
        }

        cb(null, src, map);
    });
};
