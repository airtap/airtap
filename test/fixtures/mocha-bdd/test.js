var assert = require('assert');

describe('suite', function() {
    it('should pass', function(done) {
        assert.ok(true);
        done();
    });

    it('should fail', function(done) {
        assert.ok(false);
        done();
    });

    it.skip('should be skipped', function(done) {
        assert.ok(false);
        done();
    });
});
