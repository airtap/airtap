var through = require('through');
var parser = require('tap-parser');
var inspect = require('util').inspect;

var ZuulReporter = require('../zuul');

process.stdout = through();

if (typeof console === 'undefined') {
  console = {};
}

var originalLog = console.log;
console.log = function (msg) {
    var index = 1;
    var args = arguments;

    if (typeof msg === 'string') {
        msg = msg.replace(/(^|[^%])%[sd]/g, function (_, s) {
            return s + args[index++];
        });
    }
    else msg = inspect(msg);

    for (var i = index; i < args.length; i++) {
        msg += ' ' + inspect(args[i]);
    }

    process.stdout.write(msg + '\n');

    if (typeof originalLog === 'function') {
        return originalLog.apply(this, arguments);
    }
    else if (originalLog) return originalLog(arguments[0]);
};

var reporter = ZuulReporter(run);

var previous_test = undefined;
var assertions = 0;
var done = false;

var parse_stream = parser(function(results) {
  reporter.done();
});

parse_stream.on('comment', function(comment) {
  if (done) {
    return;
  }

  if (previous_test) {
    reporter.test_end({
      passed: assertions === 0,
      name: previous_test.name
    });
  }

  previous_test = {
    name: comment
  };

  assertions = 0;

  reporter.test({
    name: comment
  });
});

parse_stream.on('assert', function(assert) {
  if (!assert.ok) {
    assertions++;
  }

  reporter.assertion({
    result: assert.ok,
    expected: undefined,
    actual: undefined,
    message: assert.name,
    error: undefined,
    stack: undefined
  });
});

parse_stream.on('plan', function(plan) {
  done = true;

  if (previous_test) {
    reporter.test_end({
      passed: assertions === 0,
      name: previous_test.name
    });
  }
  reporter.done();
});

parse_stream.on('results', function(results) {
});

parse_stream.on('extra', function(extra) {
});

process.stdout.pipe(parse_stream);

function run() {
  // tape tests already start by default
  // I don't like this stuff, very annoying to interface with
}
