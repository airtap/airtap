var path = require('path');
var fs = require('fs');

var express = require('express');
var browserify = require('browserify');

var mocha_path = path.dirname(require.resolve('mocha'));

var fixture = fs.readFileSync(__dirname + '/../fixtures/index.html', 'utf-8');
var client_file = require.resolve('../fixtures/client.js');

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

    var bundle_opts = {};

    var mocha_opts = {
        ui: ui
    };

    var app = express();

    app.use(app.router);
    app.use('/__mocha/', express.static(mocha_path));

    app.get('/__mocha', function(req, res) {
        res.send(fixture.replace('__mocha_opts__', JSON.stringify(mocha_opts)));
    });

    app.get('/__mocha/test-bundle.js', function(req, res, next) {
        res.contentType('application/javascript');
        create_bundle(files).bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }
            res.end(src);
        });
    });

    app.get('/__mocha/client.js', function(req, res, next) {
        res.contentType('application/javascript');
        var bundler = browserify();
        bundler.require(client_file, { entry: true });
        bundler.bundle(bundle_opts, function(err, src) {
            if (err) {
                return next(err);
            }
            res.end(src);
        });
    });

    return app;
};
