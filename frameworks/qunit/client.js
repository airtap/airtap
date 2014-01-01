var ZuulReporter = require('../zuul');

var reporter = ZuulReporter(run);

QUnit.config.autostart = false;

QUnit.begin(function() {
});

QUnit.done(function(details) {
    reporter.done();
});

QUnit.testStart(function(details) {
    reporter.test({
        name: details.name
    });
});

QUnit.testDone(function(details) {
    reporter.test_end({
        name: details.name,
        passed: details.passed
    });
});

QUnit.log(function(details) {
    reporter.assertion({
        result: details.result,
        expected: details.expected,
        actual: details.actual,
        message: details.message,
        source: details.source
    });
});

function run() {
    QUnit.start();
}
