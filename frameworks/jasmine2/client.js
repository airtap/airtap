var ZuulReporter = require('../zuul');
var reporter = ZuulReporter(run);

function ZuulJasmineReporter() {}

ZuulJasmineReporter.prototype.reportFirstSpecFailure = function(results) {
    if (!results.length) {
        return;
    }

    var result = results[0];
    reporter.assertion({
        result: false,
        actual: result.actual,
        expected: result.expected,
        message: result.message,
        source: result.stack
    });
};

ZuulJasmineReporter.prototype.getFullSpecName = function(spec, separator) {
    separator = separator || " :: ";

    function getFullSuiteName(suite) {
        var parentSuitesNames = suite.parentSuite ? getFullSuiteName(suite.parentSuite) + separator : "";
        return parentSuitesNames + suite.description;
    }

    return getFullSuiteName(this.suite) + separator + spec.description;
};

ZuulJasmineReporter.prototype.jasmineDone = function () {
    reporter.done();
};

ZuulJasmineReporter.prototype.suiteStarted = function(suite) {
    this.suite = suite;
};

ZuulJasmineReporter.prototype.specStarted = function (spec) {
    reporter.test({
        name: this.getFullSpecName(spec)
    });
};

ZuulJasmineReporter.prototype.specDone = function (spec) {
    var passed = !spec.failedExpectations.length;

    if (!passed) {
        this.reportFirstSpecFailure(spec.failedExpectations);
    }

    reporter.test_end({
        name: this.getFullSpecName(spec),
        passed: passed
    });
};

var zuulJasmineReporter = new ZuulJasmineReporter();

// Set up jasmine
var jasmineRequire = getJasmineRequireObj();
var jasmineCore = jasmineRequire.core(jasmineRequire);
window.jasmine = jasmineCore;
var jasmineEnv = jasmineCore.getEnv();
var jasmineInterface = jasmineRequire.interface(jasmineCore, jasmineEnv);
for (var key in jasmineInterface) {
    window[key] = jasmineInterface[key];
}

jasmineEnv.addReporter(zuulJasmineReporter);

function run() {
    jasmineEnv.execute();
}
