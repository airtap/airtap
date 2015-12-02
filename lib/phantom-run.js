// THIS IS A PHANTOMJS SCRIPT FILE //
// see PhantomBrowser.js for use //

var page = require('webpage').create();
var system = require('system');

var url = system.args[1];
var systemMessages = [];

phantom.onError = function(msg, trace) {
    systemMessages.push({
        type: 'exception',
        message: msg,
        trace: trace
    });
};

page.onError = function(msg, trace) {
    systemMessages.push({
        type: 'exception',
        message: msg,
        trace: trace
    });
};

page.open(url, function(status) {
    var msg_tid = setInterval(function() {
        var msgs = page.evaluate(function() {
            return window.zuul_msg_bus && window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length);
        }) || [];

        var messages = msgs.concat(systemMessages.splice(0, systemMessages.length));

        messages.forEach(function(msg) {
            console.log(JSON.stringify(msg));
            if (msg.type === 'exception') {
                console.error(msg.message);
                console.trace(msg.trace);
                return setTimeout(function() {
                    phantom.exit(1);
                });
            }
            if (msg.type === 'done') {
                return setTimeout(function() {
                  phantom.exit(msg.passed ? 0 : 1);
                });
            }
        });
    }, 100);
});
