describe('suite', function() {
    it('should pass', function() {
        expect( true ).toBeTruthy();
    });

    it('should fail', function() {
        expect( true ).toBeFalsy();
    });

    xit('should be skipped', function() {
        expect( true ).toBeFalsy();
    });
});
