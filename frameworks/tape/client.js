var finished = require('tap-finished');
var parser = require('tap-parser');

var ZuulReporter = require('../zuul');

if (typeof global.console === 'undefined') {
    global.console = {};
}

var reporter = ZuulReporter(run);
var previous_test = undefined;
var assertions = 0;
var done = false;
var noMoreTests = false;

var parse_stream = parser();

var finished_stream = finished(function() {
    done = true;
    parse_stream.end();
    reporter.done();
});

var originalLog = global.console.log;
global.console.log = function () {
    var msg = arguments[0];

    // do not write in a closed WriteStream
    if (!done) {
        parse_stream.write(msg + '\n');
        finished_stream.write(msg + '\n');
    }

    // transfer log to original console,
    // this shows the tap output in console
    // and also let the user add console logs
    if (typeof originalLog === 'function') {
        return originalLog.apply(this, arguments);
    }
};

parse_stream.on('comment', function(comment) {
    // if we received 'plan' then no need to go further
    if (noMoreTests) {
        return;
    }

    endPreviousTestIfNeeded();

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
        message: assert.name || 'unnamed assert',
        error: undefined,
        stack: undefined
    });
});

parse_stream.on('plan', function(plan) {
    // starting here, we know the full tape suite is finished
    endPreviousTestIfNeeded();
    noMoreTests = true;
});

function endPreviousTestIfNeeded() {
    if (previous_test) {
        reporter.test_end({
            passed: assertions === 0,
            name: previous_test.name
        });
    }
}

function run() {
    // tape tests already start by default
    // I don't like this stuff, very annoying to interface with
}
