var bouncy = require('bouncy');
var tunnel = require('localtunnel');
var debug = require('debug')('zuul:setup');

var user_server = require('./user-server');

// sets up a test instance
// cb(err, instance)
// instance.shutdown() terminates the instance
function setup_test_instance(opt, cb) {

    var support_server = undefined;
    var localtunnel = undefined;

    if (opt.server) {
        support_server = user_server(opt.server);
    }

    var config = opt;
    var control_port = opt.control_port;

    var support_port = undefined;
    if (support_server) {
        support_port = support_server.port;
    }

    // TODO start support server
    // currently happens within user_server

    var bouncer_port = 0;
    if (config.local && parseInt(config.local)) {
        bouncer_port = config.local;
    }

    var bouncer = bouncy(function (req, res, bounce) {
        var url = req.url.split('?')[0];
        if (!support_port || url.split('/')[1] === '__zuul') {
            bounce(control_port, { headers: { connection: 'close' }});
            return;
        }

        bounce(support_port, { headers: { connection: 'close' }});
    });

    bouncer.listen(bouncer_port, bouncer_active);

    function bouncer_active() {
        var app_port = bouncer.address().port;
        debug('bouncer active on port %d', app_port);

        if (!config.tunnel) {
            return cb(null, 'http://localhost:' + app_port + '/__zuul');
        }

        tunnel(app_port, function(err, lt) {
            if (err) {
                return cb(err);
            }

            var url = lt.url + '/__zuul';
            localtunnel = lt;
            cb(null, url);
        });
    };

    function shutdown() {
        bouncer.close();

        if (localtunnel) {
            localtunnel.close();
        }

        if (support_server) {
            support_server.process.kill('SIGKILL');
        }
    }

    return {
        shutdown: shutdown
    };
}

module.exports = setup_test_instance;
