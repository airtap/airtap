var ZuulReporter = require('../zuul');
var reporter = ZuulReporter(run);

function ZuulJasmineReporter() {}

function getFullSpecName(spec, separator) {
    separator = separator || " :: ";

    function getFullSuiteName(suite) {
        var parentSuitesNames = suite.parentSuite ? getFullSuiteName(suite.parentSuite) + separator : "";
        return parentSuitesNames + suite.description;
    }

    return getFullSuiteName(spec.suite) + separator + spec.description;
}

function reportFirstSpecFailure(results) {
    for (var i = 0; i < results.length; i++) {
        if (!results[i].passed()) {
            var result = results[i];
            reporter.assertion({
                result: false,
                actual: result.actual,
                expected: result.expected,
                message: result.trace.message,
                error: result.trace,
                source: result.trace.stack
            });
            return;
        }
    }

}

ZuulJasmineReporter.prototype.reportRunnerResults = function () {
    reporter.done();
};

ZuulJasmineReporter.prototype.reportSpecStarting = function (spec) {
    reporter.test({
        name: getFullSpecName(spec)
    });
};

ZuulJasmineReporter.prototype.reportSpecResults = function (spec) {
    var passed = !spec.results().failedCount;

    if (!passed) {
        reportFirstSpecFailure(spec.results_.items_);
    }

    reporter.test_end({
        name: getFullSpecName(spec),
        passed: passed
    });
};

var zuulJasmineReporter = new ZuulJasmineReporter();
var jasmineEnv = jasmine.getEnv();

jasmineEnv.addReporter(zuulJasmineReporter);

function run() {
    jasmineEnv.execute();
}
