// THIS IS A PHANTOMJS SCRIPT FILE //
// see PhantomBrowser.js for use //

var page = require('webpage').create();
var system = require('system');

var url = system.args[1];

page.onError = function(msg) {
    console.error(JSON.stringify(msg));
};

page.onConsoleMessage = function(msg) {
    console.log(JSON.stringify({
        type: 'console',
        msg: msg
    }));
};

page.open(url, function(status) {
    var msg_tid = setInterval(function() {
        var msgs = page.evaluate(function() {
            var latest = window.zuul_msg_bus;
            window.zuul_msg_bus = [];
            return latest;
        });

        msgs.forEach(function(msg) {
            if (msg.type === 'done') {
                phantom.exit(msg.passed ? 0 : 1);
                return;
            }

            console.log(JSON.stringify(msg));
        });
    }, 1000);
});
