QUnit.done(function(details) {
    details.passed = details.failed === 0;
    window.zuul_results = details;
});
