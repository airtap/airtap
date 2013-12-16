var harness = window.mochaPhantomJS || mocha;
if (harness.checkLeaks) {
  harness.checkLeaks();
}

var runner = harness.run();

var suite = harness.suite;
if (suite.suites.length === 0 && suite.tests.length === 0) {
  window.zuul_results = {
    failures: 0,
    passed: false
  };
}

// Listen to `runner` events to populate a global
// `.mochaResults` var which may be used by selenium
// to report on results.

var failed = [];

runner.on('fail', function(test, err) {
  failed.push({
    title: test.title,
    fullTitle: test.fullTitle(),
    error: {
      message: err.message,
      stack: err.stack
    }
  });
});

runner.on('end', function(){
  runner.stats.failed = failed;
  runner.stats.passed = failed.length === 0;
  window.zuul_results = runner.stats;
});
