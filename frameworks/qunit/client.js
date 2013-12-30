var load = require('load-script');

QUnit.done(function(details) {
    details.passed = details.failed === 0;
    window.zuul_results = details;
});

load('/__zuul/test-bundle.js', run);

function run() {
}
