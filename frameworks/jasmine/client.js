var ZuulReporter = require('../zuul');
var reporter = ZuulReporter(run);


function ZuulJasmineReporter() {
}

function getFullSpecName(spec, separator) {
    separator = separator || " :: ";

    function getFullSuiteName(suite) {
        var parentSuitesNames = suite.parentSuite ? getFullSuiteName(suite.parentSuite) + separator : "";
        return parentSuitesNames + suite.description;
    }


    return getFullSuiteName(spec.suite) + separator + spec.description;
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
    reporter.test_end({
        name: getFullSpecName(spec),
        passed: !!spec.results().passedCount
    });
};

var zuulJasmineReporter = new ZuulJasmineReporter();
var jasmineEnv = jasmine.getEnv();


jasmineEnv.addReporter(zuulJasmineReporter);

function run() {
    jasmineEnv.execute();
}
