// builtin
var child_proc = require('child_process');
var path = require('path');
var fs = require('fs');

// vendor
var theBrowserify = require('browserify');
var express = require('express');

module.exports = function(options) {
    options = getUsefulOptions(options, options.config || {});
    var server = setupServer(options);

    if (options.port) {
        notifyThatServerIsReady(server);
    } else {
        runInPhantomJS(server);
    }
};

/**
 * Pulls out useful options out of the options and config objects
 * 
 * @name getUsefulOptions
 * @function
 * @param options {Object} provided via the command line
 * @param config {Object} provided by requiring a config file, i.e. via --config ./my-options.js
 * @return {Object} aggregated options
 */
function getUsefulOptions(options, config) {
    var port = options.port ? parseInt(options.port, 10) : null;
    if (port && isNaN(port)) {
        throw new Error('port must be a number');
    }

    // html harness
    var fixture = config.fixture
        ? config.fixture()
        : fs.readFileSync(path.resolve(__dirname, '../fixtures/index.html'), 'utf-8');

    var bundleOpts = config.bundleOpts || { insertGlobals: true, debug: !!options.port };

    var initBrowserify = config.initBrowserify || function (browserify) { browserify(); };

    // TODO (shtylman) debug and watch mode for browserify?

    var files = options.files || ['test'];

    // options which will be passed to `mocha.setup`. From one of:
    // - `options.mochaOpts` object
    // - `options.mochaOpts` string pointing to file to read
    // - default: try cwd/test/mocha.opts (like Mocha does)
    var mochaOpts = {};

    if (typeof options.mochaOpts === 'object' && options.mochaOpts !== null) {
        mochaOpts = options.mochaOpts;
    } else {
        var mochaOptsFileName = typeof options.mochaOpts === 'string'
            ? options.mochaOpts
            : path.resolve('test/mocha.opts');

        if (fs.existsSync(mochaOptsFileName)) {
            var content = fs.readFileSync(mochaOptsFileName, 'utf8');

            content.split('\n').forEach(function(line) {
                if (line.length === 0) {
                    return;
                }

                var split = line.split(' ');

                var key = split.shift().replace('--', '');
                var value = split.join(' ');

                mochaOpts[key] = value;
            });
        }
    }

    // this is the only non-optional mocha option.
    mochaOpts.ui = options.ui || mochaOpts.ui || 'bdd';

    // the default (html) reporter must be used for browser testing
    delete mochaOpts.reporter;

    return {
        port: port,
        fixture: fixture,
        bundleOpts: bundleOpts,
        initBrowserify: initBrowserify,
        files: files,
        mochaOpts: mochaOpts,
        initApp: config.initApp,
        wwwroot: options.wwwroot
    };
}

function setupServer(options) {
    // location of mocha resources
    var mocha_path = path.dirname(require.resolve('mocha'));

    // setup http server to serve our harness files
    var app = express();

    if (options.initApp) {
        options.initApp(app, express);
    }

    app.use(app.router);

    if (options.wwwroot) {
        app.use(express.static(options.wwwroot));
    }

    app.get('/', function(req, res) {
        res.send(options.fixture.replace('__mocha_opts__', JSON.stringify(options.mochaOpts)));
    });

    app.get('/build.js', function(req, res) {
        res.contentType('application/javascript');
        createBundle().bundle(options.bundleOpts, function(err, src) {
            if (err) {
              console.error(err);
              return res.send(500);
            }
            res.end(src);
        });
    });
    app.get('/mocha.js', function(req, res) {
        res.sendfile(mocha_path + '/mocha.js');
    });
    app.get('/mocha.css', function(req, res) {
        res.sendfile(mocha_path + '/mocha.css');
    });

    // go go go!!
    var server = app.listen(options.port);

    function createBundle() {
        var bundle = options.initBrowserify(theBrowserify);

        options.files.forEach(function(file_or_dir) {
            var stat = fs.statSync(file_or_dir);

            if (stat.isFile()) {
                var file = path.resolve(file_or_dir);
                return bundle.require(file, { entry: true });
            }

            // ignore non js and hidden files
            var files = fs.readdirSync(file_or_dir).filter(function(file) {
                return path.extname(file) === '.js' && file[0] !== '.';
            });

            files = files.map(function(file) {
                return path.resolve(file_or_dir, file);
            });

            files.forEach(function (file) {
                bundle.require(file, { entry: true });
            });
        });

        return bundle;
    }

    return server;
}

function notifyThatServerIsReady(server) {
    server.once('listening', function() {
        var port = server.address().port;
        console.log('server listening: http://localhost:' + port);
    });
}

function runInPhantomJS(server) {
    // location of mocha_phantomjs runner
    var mocha_phantom = require.resolve('mocha-phantomjs');
    var phantom = require('phantomjs').path;

    server.on('listening', function() {
        var port = server.address().port;

        // launch phantomjs to run the harness files
        var cmd = phantom;
        var args = [mocha_phantom, 'http://localhost:' + port];

        var child = child_proc.spawn(cmd, args);

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on('exit', function(code) {
            server.close();
            process.exit(code);
        });
    });
}
