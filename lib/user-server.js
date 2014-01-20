var spawn = require('child_process').spawn;

var copy = require('shallow-copy');
var parse_cmd = require('shell-quote').parse;
var debug = require('debug')('zuul:user-server');

module.exports = function(cmd) {
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
    var port = Math.floor((Math.pow(2, 16) - 10000) * Math.random() + 10000);
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

    return { port: port, process: ps };
};
