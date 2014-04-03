var path = require('path');
var fs = require('fs');

var express = require('express');
var expstate = require('express-state');
var browserify = require('browserify');

module.exports = function(config) {
    var files = config.files;
    var ui = config.ui;
    var framework_dir = config.framework_dir;
    var prj_dir = config.prj_dir;

    var bundle_opts = { debug: true };

    files = files.map(function(file) {
        return path.resolve(file);
    });

    var user_html = '';
    if (config.html) {
        user_html = fs.readFileSync(path.join(prj_dir, config.html), 'utf-8');
    }

    var build;
    // default builder is browserify which we provide
    config.builder = config.builder || '../lib/builder-browserify';

    if (config.builder) {
        build = require(config.builder);
    }

    var app = express();

    expstate.extend(app);

    app.set('state namespace', 'zuul');
    app.expose(ui, 'ui');
    app.expose(config.name, 'title');

    app.set('views', __dirname + '/../frameworks');
    app.set('view engine', 'html');
    app.engine('html', require('hbs').__express);

    app.use(function(req, res, next) {
        res.locals.title = config.name;
        res.locals.user_scripts = config.scripts || [];
        res.locals.user_html = user_html;
        next();
    });

    app.use(app.router);

    var bundle_router = new express.Router();

    app.use(bundle_router.middleware);

    // zuul files
    app.use('/__zuul', express.static(__dirname + '/../frameworks'));
    // framework files
    app.use('/__zuul', express.static(framework_dir));

    // any user's files
    app.use(express.static(process.cwd()));

    app.get('/__zuul', function(req, res) {
        res.render('index');
    });

    var map = undefined;

    bundle_router.get('/__zuul/client.js', function(req, res, next) {
        res.contentType('application/javascript');
        var bundler = browserify();
        bundler.require(path.join(framework_dir, '/client.js'), { entry: true });
        bundler.bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }

            res.send(src);
        });
    });

    bundle_router.get('/__zuul/test-bundle.map.json', function(req, res, next) {
        if (!map) {
            return res.status(404).send('');
        }

        res.json(map);
    });

    bundle_router.get('/__zuul/test-bundle.js', function(req, res, next) {
        res.contentType('application/javascript');

        build(files, { basedir: prj_dir }, function(err, src, srcmap) {
            if (err) {
                return next(err);
            }

            if (srcmap) {
                map = srcmap;
                map.file = '/__zuul/test-bundle.js';
                src += '//# sourceMappingURL=' + '/__zuul/test-bundle.map.json';
            }

            res.send(src);
        });
    });

    return app;
};
