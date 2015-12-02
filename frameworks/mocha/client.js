var ZuulReporter = require('../zuul');

// convert zuul mocha ui's to our ui
var ui_map = {
  'mocha-bdd': 'bdd',
  'mocha-qunit': 'qunit',
  'mocha-tdd': 'tdd'
};

var mocha_opt = {
  ui: ui_map[zuul.ui],
  reporter: function() {}
};

mocha.setup(mocha_opt);

// whitelist the `msWDfn` global for Microsoft Edge
if (/ Edge\/[1-9][0-9]\.[0-9]+$/.test(navigator.userAgent)) {
  mocha.globals('msWDfn');
}

var reporter = ZuulReporter(run);

function getTitle(item) {
  var title = item.title;
  if(item.parent.title){
    return getTitle(item.parent) + ' :: ' + title;
  }

  return title;
}

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
      message: err.message,
      error: err,
      source: err.stack
    });

  });

  runner.on('pending', function(test) {
    reporter.skippedTest({
      name: getTitle(test)
    });
  });

  runner.on('test', function(test) {
    reporter.test({
      name: getTitle(test)
    });
  });

  runner.on('test end', function(test) {
    // mocha is broken
    // https://github.com/defunctzombie/zuul/issues/35#issuecomment-32622253
    if (test.state === undefined) {
      return;
    }

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
