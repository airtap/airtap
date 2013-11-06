// sets up a tunnel to our local app on the given port

var localtunnel = require('localtunnel');
var debug = require('debug')('zuul:tunnel');

// setup a tunnel to the given local port
// cb(err, tunnel-url)
// @return tunnel client to manage tunnel
module.exports = function(port, cb) {
    debug('tunnel requested to port %d', port);

    var client = localtunnel.connect({
        host: 'http://localtunnel.me',
        port: port
    });

    client.on('url', function(url) {
        cb(null, url);
    });

    return client;
};
