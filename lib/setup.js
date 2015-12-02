var http = require('http');
var httpProxy = require('http-proxy');
var debug = require('debug')('zuul:setup');

var user_server = require('./user-server');

// sets up a test instance
// cb(err, instance)
// instance.shutdown() terminates the instance
function setup_test_instance(opt, cb) {

    var support_server = undefined;
    var bouncer = undefined;
    var Tunnel;
    if (typeof opt.tunnel === 'string') {
        Tunnel = require('zuul-' + opt.tunnel);
        debug('using zuul-%s to tunnel', opt.tunnel);
    } else if (typeof opt.tunnel === 'object' && opt.tunnel.type) {
        Tunnel = require('zuul-' + opt.tunnel.type);
        debug('using zuul-%s to tunnel', opt.tunnel.type);
    } else {
        Tunnel = require('zuul-localtunnel');
        debug('using zuul-localhost to tunnel');
    }

    var tunnel = new Tunnel(opt);

    if (opt.server) {
        user_server(opt.server, setup);
    }
    else {
        setup();
    }

    function setup(_support_server) {
        support_server = _support_server;
        var config = opt;
        var control_port = opt.control_port;

        var support_port = undefined;
        if (support_server) {
            support_port = config.support_port = support_server.port;
        }

        // TODO start support server
        // currently happens within user_server

        var bouncer_port = 0;
        if (config.local && parseInt(config.local)) {
            bouncer_port = config.local;
        }

        if (config.phantom && parseInt(config.phantom)) {
            bouncer_port = config.phantom;
        }

        var proxy = httpProxy.createProxy();
        proxy.on('proxyReq', on_proxy_req);

        bouncer = http.createServer();
        bouncer.on('request', on_request(proxy.web));
        bouncer.on('upgrade', on_request(proxy.ws));

        function on_request(bounce) {
            return function(req, res) {
                var args = [].slice.call(arguments);
                if (is_control_req(req)) {
                    args.push({ target: 'http://localhost:' + control_port });
                    bounce.apply(proxy, args);
                    return;
                }

                args.push({ target: 'http://localhost:' + support_port }, on_support_server_proxy_done);
                bounce.apply(proxy, args);
            };
        }

        function on_proxy_req(proxyReq, req, res, options) {
            if (is_control_req(req) ||
                (req.headers.connection && req.headers.connection.toLowerCase().indexOf('upgrade') === -1)) {
                proxyReq.setHeader('connection', 'close');
            }
        }

        function on_support_server_proxy_done(err, req, res) {
            if (err.code === 'ECONNRESET' && res && res.socket && res.socket.destroyed === true) {
                debug('Request to support-server:%s was canceled by the client, ignoring the proxy error');
            }
        }

        function is_control_req(req) {
            var url = req.url.split('?')[0];
            return !support_port || url.split('/')[1] === '__zuul';
        }

        bouncer.listen(bouncer_port, bouncer_active);

        function bouncer_active() {
            var app_port = bouncer.address().port;
            debug('bouncer active on port %d', app_port);

            if (!config.tunnel) {
                return cb(null, 'http://localhost:' + app_port + '/__zuul');
            }

            tunnel.connect(app_port, cb);
        };
    }

    function shutdown() {
        bouncer.close();
        tunnel.close();

        if (support_server) {
            support_server.process.kill('SIGKILL');
        }
    }

    return {
        shutdown: shutdown
    };
}

module.exports = setup_test_instance;
