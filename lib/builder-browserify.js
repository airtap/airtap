'use strict';

var _ = require('lodash');
var watchify = require('watchify');
var browserify = require('browserify');
var istanbul = require('browserify-istanbul');
var convert = require('convert-source-map');
var debug = require('debug')('zuul:browserify');
var humanizeDuration = require('humanize-duration');

function configure(bundler, cfg) {
    if (!cfg) {
        return;
    }

    var registerableCfg = [
        'plugin',
        'external',
        'ignore',
        'exclude',
        'transform',
        'add',
        'require'
    ];

    cfg.forEach(registerable);

    // grab registerable configs and register them
    function registerable (cfgObj) {
        _.forIn(cfgObj, function(value, key) {
            if (registerableCfg.indexOf(key) !== -1) {
                register(key, cfgObj);
            }
        });
    }

    function register (type, o) {
        debug('registering %s: %s', type, o[type]);
        if (type === 'transform' && typeof o[type] === 'object') {
            bundler[type](o[type].name, _.omit(o[type], 'name'));
        } else {
            bundler[type](o[type], _.omit(o, type));
        }
    }
}

// the builder API is var build = require('builder')(files, config); build(cb)
// So that we can have multiple different `watchifyBundler` caches per build instance.
module.exports = function(files, config) {
    var watchifyBundler = initBundler(files, config);

    return function(cb) {
        var start = Date.now();
        watchifyBundler.bundle(function(err, buf) {
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

            debug('test files took %s to bundle', humanizeDuration(Date.now() - start));
            cb(null, src, map);
        });
    };
};

function initBundler(files, config) {
    var opt = {
        debug: true,
        basedir: config.prj_dir
    };

    // watchify options
    // https://github.com/substack/watchify#var-w--watchifyb-opts
    opt = _.assign(opt, {
        cache: {},
        packageCache: {},
        fullPaths: true
    });

    var userConfig = _.find(config.browserify, 'options');
    var browserifyOptions = _.assign({}, opt);

    if (userConfig) {
        browserifyOptions = _.assign(browserifyOptions, userConfig.options || {});
    }

    var bundler = browserify(browserifyOptions);

    debug('configuring browserify with provided options: %j', config.browserify);
    configure(bundler, config.browserify);

    if (config.coverage && config.instrument && config.local) {
        debug('using istanbul transform');
        bundler.transform(istanbul({
            defaultIgnore: true
        }));
    }

    debug('adding to bundle: %j', files);
    files.forEach(function(file) {
        bundler.require(file, { entry: true });
    });

    bundler = watchify(bundler);

    return bundler;
}
