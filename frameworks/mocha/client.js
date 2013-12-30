var ZuulReporter = require('../zuul');

// convert zuul mocha ui's to our ui
var ui_map = {
  'mocha-bdd': 'bdd',
  'mocha-qunit': 'qunit',
  'mocha-tdd': 'tdd'
};

// TODO(shtylman) setup mocha?
mocha.setup({
  ui: ui_map[zuul.ui],
  reporter: function() {}
});

var reporter = ZuulReporter(run);

function run(err) {
  if (err) {
    return reporter.done(err);
  }

  var harness = mocha;
  if (harness.checkLeaks) {
    harness.checkLeaks();
  }

  var suite = harness.suite;
  if (suite.suites.length === 0 && suite.tests.length === 0) {
    return reporter.done(new Error('no tests defined'));
  }

  var runner = harness.run();

  runner.on('fail', function(test, err) {
    reporter.assertion({
      result: false,
      actual: undefined,
      expected: undefined,
      error: err,
      source: err.stack
    });

  });

  runner.on('test', function(test) {
    reporter.test({
      name: test.title
    });
  });

  runner.on('test end', function(test) {
    reporter.test_end({
      name: test.title,
      passed: test.state === 'passed',
      duration: test.duration
    });
  });

  runner.on('suite', function(suite) {
    reporter.suite({
      name: suite.title
    });
  });

  runner.on('suite end', function(suite) {
    reporter.suite_end(suite);
  });

  runner.on('end', function() {
    reporter.done();
  });

  runner.on('error', function(err) {
    reporter.done(err);
  });
}

