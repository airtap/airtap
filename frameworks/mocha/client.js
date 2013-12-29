var load = require('load-script');

// convert zuul mocha ui's to our ui
var ui_map = {
  'mocha-bdd': 'bdd',
  'mocha-qunit': 'qunit',
  'mocha-tdd': 'tdd'
};

// TODO(shtylman) setup mocha?
mocha.setup({
  ui: ui_map[zuul.ui]
});

load('/__zuul/test-bundle.js', run);

function run(err) {
  if (err) {
    window.zuul_results = {
      failures: 0,
      passed: false
    };
    return;
  }

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
}

