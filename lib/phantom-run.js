// THIS IS A PHANTOMJS SCRIPT FILE //
// see PhantomBrowser.js for use //

var page = require('webpage').create();
var system = require('system');

var url = system.args[1];

page.onError = function(msg) {
    console.error(JSON.stringify(msg));
};

page.open(url, function(status) {
    var msg_tid = setInterval(function() {
        var msgs = page.evaluate(function() {
            return window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length);
        });

        msgs.forEach(function(msg) {
            console.log(JSON.stringify(msg));
            if (msg.type === 'done') {
                return phantom.exit(msg.passed ? 0 : 1);
            }
        });
    }, 100);
});
