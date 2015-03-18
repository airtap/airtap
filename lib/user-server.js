var spawn = require('child_process').spawn;

var http = require('http');
var copy = require('shallow-copy');
var parse_cmd = require('shell-quote').parse;
var debug = require('debug')('zuul:user-server');

module.exports = function(server, callback) {
    debug('user server: %s', server);

    var cmd;
    var cwd;
    var wait = 0;
    if (server !== null && server.cmd) {
        // expect the following format in .zuul.yml
        // server:
        //   cmd: ./test/support/server.js
        //   cwd: ./anotherapp
        cmd = server.cmd;
        cwd = server.cwd;
        wait = server.wait;
    }
    else {
        // expect the following format in .zuul.yml
        // server: ./test/support/server.js
        cmd = server;
    }

    if (!cwd) {
        // TODO(shtylman) is this right?
        cwd = process.cwd();
    }

    var env = copy(process.env);

    get_open_port(function(port) {
        if (!Array.isArray(cmd)) {
            cmd = parse_cmd(cmd, { ZUUL_PORT: port });
        }

        if (/\.js$/.test(cmd[0])) {
            cmd.unshift(process.execPath);
        }

        env.ZUUL_PORT = port;

        debug('user server port %d', port);

        var ps = spawn(cmd[0], cmd.slice(1), { cwd: cwd, env: env });
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

        return setTimeout(function(){
            callback({ port: port, process: ps });
        }, wait);
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
