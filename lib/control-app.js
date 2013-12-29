var path = require('path');
var fs = require('fs');

var express = require('express');
var convert = require('convert-source-map');
var expstate = require('express-state');
var browserify = require('browserify');

function create_bundle(files) {
    var bundler = browserify();

    files.forEach(function(file_or_dir) {
        var stat = fs.statSync(file_or_dir);

        if (stat.isFile()) {
            var file = path.resolve(file_or_dir);
            return bundler.require(file, { entry: true });
        }

        // ignore non js and hidden files
        fs.readdirSync(file_or_dir).filter(function(file) {
            return path.extname(file) === '.js' && file[0] !== '.';
        }).map(function(file) {
            return path.resolve(file_or_dir, file);
        }).forEach(function (file) {
            bundler.require(file, { entry: true });
        });
    });

    return bundler;
}

module.exports = function(config) {
    var files = config.files;
    var ui = config.ui;
    var framework = config.framework;

    var bundle_opts = { debug: true };

    var user_html = '';
    if (config.html) {
        user_html = fs.readFileSync(path.join(process.cwd(),config.html), 'utf-8');
    }

    var app = express();

    expstate.extend(app);

    app.set('state namespace', 'zuul');
    app.expose(ui, 'ui');

    app.set('views', __dirname + '/../frameworks');
    app.set('view engine', 'html');
    app.engine('html', require('hbs').__express);

    app.use(function(req, res, next) {
        res.locals.title = config.name;
        res.locals.user_scripts = config.scripts || [];
        res.locals.user_html = user_html;
        res.locals.framework_html = framework.html || '';
        res.locals.framework_css = framework.css;
        res.locals.framework_scripts = framework.js;
        next();
    });

    app.use(app.router);

    var bundle_router = new express.Router();

    app.use(bundle_router.middleware);

    // framework files
    app.use('/__zuul', express.static(framework.dir));
    // any user's files
    app.use(express.static(process.cwd()));

    app.get('/__zuul', function(req, res) {
        res.render('index');
    });

    var map = undefined;

    bundle_router.get('/__zuul/pre.js', function(req, res, next) {
        res.contentType('application/javascript');
        create_bundle([framework.dir + '/pre.js']).bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }

            res.send(src);
        });
    });

    bundle_router.get('/__zuul/test-bundle.map.json', function(req, res, next) {
        res.json(map);
    });

    bundle_router.get('/__zuul/test-bundle.js', function(req, res, next) {
        res.contentType('application/javascript');
        create_bundle(files).bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }

            var srcmap = convert.fromComment(src);
            src = convert.removeComments(src);
            // need to strip out the debug sourcemap and server as separate url

            if (srcmap) {
                src += '//# sourceMappingURL=' + '/__zuul/test-bundle.map.json';
                map = srcmap.toObject();
            }

            res.end(src);
        });
    });

    return app;
};
