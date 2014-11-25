'use strict';

var _ = require('lodash');
var browserify = require('browserify');
var convert = require('convert-source-map');

function configure (bundler, cfg) {
    if (!cfg) {
        return;
    }

    ['plugin', 'external', 'ignore', 'exclude', 'transform', 'add', 'require'].forEach(registerable);

    function registerable (type) {
        _.where(cfg, type).forEach(register.bind(null, type));
    }

    function register (type, o) {
        bundler[type](o[type], _.omit(o, type));
    }
}

module.exports = function (files, config, cb) {
    var opt = {
        debug: true,
        basedir: config.prj_dir
    };
    var browserifyOptions = _.find(bro, 'options');
    var bundler = browserify(browserifyOptions ? _.assign({}, opt, browserifyOptions.options) : opt);

    configure(bundler, config.browserify);

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
