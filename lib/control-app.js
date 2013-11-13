var path = require('path');
var fs = require('fs');

var express = require('express');
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
        res.locals.test_script = 'test-bundle.js';
        res.locals.framework_post_scripts = framework.post_js || [];
        next();
    });

    app.use(app.router);

    // framework files
    app.use('/__zuul', express.static(framework.dir));
    // any user's files
    app.use(express.static(process.cwd()));

    app.get('/__zuul', function(req, res) {
        res.render('index');
    });

    app.get('/__zuul/test-bundle.js', function(req, res, next) {
        res.contentType('application/javascript');
        create_bundle(files).bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }
            res.end(src);
        });
    });

    return app;
};
