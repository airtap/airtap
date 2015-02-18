var test = require('tape');

// https://github.com/defunctzombie/zuul/issues/145
test('ok', function(t) {
    t.pass();
    t.end();
});

// https://github.com/defunctzombie/zuul/issues/145
test('fail', function(t) {
    t.ok(false);
    t.end();
});

test('suite', function(t) {
    t.ok(true, 'yeah');
    t.ok(false, 'WOOPS');
    t.fail(false);
    t.end();
});

test('pass', function(t) {
    t.pass();
    t.end();
});

test('plan', function(t) {
    t.plan(1);

    setTimeout(function() {
        t.ok(true === true, 'true is true AWESOME');
    }, 10);
});

test('failed plan', {timeout: 200}, function(t) {
    t.plan(2);
    t.ok(true, 'one assert');
});

// nothing to be done
test.skip('skipped', function(t) {
    t.ok(false);
});

// test console still ok
console.log({hey: 'you'});
console.debug([1,2,3]);
console.log(1,2,[3,4]);
