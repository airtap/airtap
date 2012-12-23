// zuul test/*.js

// builtin
var child_proc = require('child_process');
var path = require('path');
var fs = require('fs');

// vendor
var browserify = require('browserify');
var express = require('express');
var optimist = require('optimist');

// location of mocha resources
var mocha_path = path.dirname(require.resolve('mocha'));

// html harness
var index = fs.readFileSync(__dirname + '/fixtures/index.html', 'utf-8');

var argv = optimist
    .usage('zuul [options] js-test-file')
    .describe('server', 'port to start harness server for manual testing')
    .describe('ui', 'mocha ui (bdd, tdd, qunit, exports')
    .default('ui', 'bdd')
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit();
}

if (argv.server && isNaN(parseInt(argv.server))) {
    console.error('--server argument must be a numeric port\n');
    optimist.showHelp(console.error);
    process.exit(-1);
}

// bundle the javascript we are interested in
var bundle = browserify({
    debug: true
});
argv._.forEach(bundle.addEntry.bind(bundle));

// setup http server to serve our harness files
var app = express();
app.get('/', function(req, res) {
    res.send(index.replace('__mocha_ui__', argv.ui));
});
app.get('/build.js', function(req, res) {
    res.contentType('application/javascript');
    res.send(bundle.bundle());
});
app.get('/mocha.js', function(req, res) {
    res.sendfile(mocha_path + '/mocha.js');
});
app.get('/mocha.css', function(req, res) {
    res.sendfile(mocha_path + '/mocha.css');
});

// go go go!!
var server = app.listen(argv.server);
var port = server.address().port;

// if user just wants a server, then stop here
if (argv.server) {
    console.log('server listening: http://localhost:' + port);
}
// default is to run under phantomjs
else {
    // location of mocha_phantomjs runner
    var mocha_phantom = require.resolve('mocha-phantomjs');

    // launch phantomjs to run the harness files
    var cmd = 'phantomjs';
    var args = [mocha_phantom, 'http://localhost:' + port];

    var child = child_proc.spawn(cmd, args);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('exit', function(code) {
        server.close();
        process.exit(code);
    });
}
