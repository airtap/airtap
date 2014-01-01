// THIS IS A PHANTOMJS SCRIPT FILE //
// see PhantomBrowser.js for use //

var page = require('webpage').create();
var system = require('system');

var url = system.args[1];
console.log('opening', url);

page.onConsoleMessage = function(msg) {
    console.log(msg);
    phantom.exit();
};

page.open(url, function(status) {
    // TODO determine if this interval should be here
    // or within the browser?
    // and how to cleanly exit this stuff
    setInterval(function() {
        page.evaluate(function() {
            if (window.zuul_results) {
                console.log(window.zuul_results);
            }
        });
    }, 1000);
});
