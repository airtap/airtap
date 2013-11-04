
var custom_server;
// user can optionally make a custom testing server
var customServer = pkg.testling.server && (function () {
    var cmd = pkg.testling.server;
    if (!Array.isArray(cmd)) cmd = parseCommand(cmd);
    if (/\.js$/.test(cmd[0])) cmd.unshift(process.execPath);

    // this can potentially cause issues if the port is not available

    var env = copy(process.env);
    env.PORT = Math.floor((Math.pow(2, 16) - 10000) * Math.random() + 10000);

    var ps = spawn(cmd[0], cmd.slice(1), { cwd: dir, env: env });
    ps.stdout.pipe(process.stdout);
    ps.stderr.pipe(process.stderr);

    ps.on('exit', function (code) {
        console.error('testling.server exited with status: ' + code);
    });

    return { port: env.PORT };
})();
