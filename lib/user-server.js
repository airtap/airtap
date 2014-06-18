var spawn = require('child_process').spawn;

var http = require('http');
var copy = require('shallow-copy');
var parse_cmd = require('shell-quote').parse;
var debug = require('debug')('zuul:user-server');

module.exports = function(cmd, callback) {
    debug('user server: %s', cmd);

    // TODO(shtylman) is this right?
    var dir = process.cwd();

    if (!Array.isArray(cmd)) {
        cmd = parse_cmd(cmd);
    }

    if (/\.js$/.test(cmd[0])) {
        cmd.unshift(process.execPath);
    }

    var env = copy(process.env);

    get_open_port(function(port) {
        env.ZUUL_PORT = port;

        debug('user server port %d', port);

        var ps = spawn(cmd[0], cmd.slice(1), { cwd: dir, env: env });
        ps.stdout.pipe(process.stdout);
        ps.stderr.pipe(process.stderr);

        function exit() {
            ps.kill('SIGTERM');
        }

        ps.once('exit', function (code) {
            debug('user server exited with status: %d', code);
            process.removeListener('exit', exit);
        });

        process.on('exit', exit);

        return callback({ port: port, process: ps });
    });
};

function get_open_port(callback) {
    var server  = http.createServer();
    server.listen(0);
    server.on('listening', function() {
        var port = server.address().port;
        server.close(function() {
            callback(port);
        });
    });
}
