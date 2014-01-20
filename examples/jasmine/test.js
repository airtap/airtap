describe('Set of tests', function () {
    it('should pass', function () {
        expect(1).toEqual(1);
    });

    describe('I am', function () {
        describe('a', function () {
            describe('very', function () {
                describe('very', function () {
                    describe('nested', function () {
                        it('spec', function () {
                            expect(1).toBe(1);
                        })
                    })
                })
            })
        })
    });

    it('should fail', function () {
        expect(1).toBe(1);
        expect(3).toEqual(4);
    })
});