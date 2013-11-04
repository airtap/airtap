var scout_browser = require('./browser');

// given a list of browsers we want to test
// expand into an actual testable list of browsers
// @param request is array of { name: 'chrome', version: <version str>, platform: <os> }
// cb(err, browsers) -> browsers is an array of { name: <browser name>, version: <version>, platform: <os> }
function expand_browsers(request, cb) {

    // query sauce API for supported browsers
    scout_browser(function(err, all_browsers) {
        if (err) {
            return cb(err);
        }

        var browsers = [];

        // turn each browser request into an array of valid browsers
        request.forEach(function(req) {
            var avail = all_browsers[req.name];
            if (!avail) {
                return;
            }

            if (req.platform) {
                avail = avail.filter(function(browser) {
                    return req.platform.toLowerCase() === browser.platform.toLowerCase() ||
                        req.platform.toLowerCase() === browser.platform_display.toLowerCase()
                });
            }

            // sort by version order
            avail.sort(function(a, b) {
                return a.version - b.version;
            });

            // remove duplicate version entries
            avail.reduce(function(prev, curr, idx, arr) {
                if (prev && prev.version === curr.version) {
                    arr[idx] = undefined;
                }
                return curr;
            });

            avail = avail.filter(Boolean);

            var version = String(req.version);
            if (version === 'latest') {
                return browsers.push.apply(browsers, avail.slice(-1));
            }

            // split version string on two dots to see if range was specified
            var split = version.split('..');

            // range specified via ##..##
            if (split.length === 2) {
                var start = split[0] - 0;
                var end = split[1];
                avail = avail.filter(function(browser) {
                    if (end === 'latest') {
                        return browser.version >= start;
                    }

                    end = end - 0;
                    return browser.version >= start && browser.version <= end;
                });
            }
            else {
                // specific version
                avail = avail.filter(function(browser) {
                    return browser.version === version;
                });
            }

            browsers.push.apply(browsers, avail);
        });

        cb(null, browsers);
    });
}

module.exports = expand_browsers;
