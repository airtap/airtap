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
            // clone because we will modify to filter down
            var avail = all_browsers[req.name].slice(0);
            if (!avail) {
                return;
            }

            if (req.platform) {
                avail = avail.filter(function(browser) {
                    return req.platform.toLowerCase() === browser.platform.toLowerCase()
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

            // version is an array, we should add each item from array
            if (Array.isArray(req.version)) {
                return req.version.forEach(function(version) {
                    browsers.push.apply(browsers, process_version_str(version));
                    return;
                });
            }

            browsers.push.apply(browsers, process_version_str(req.version));
            return;

            // return an array of browsers to match version string
            // version string can be a single version
            // or a range ##..##
            // or ##..latest
            function process_version_str(version) {
                version = String(version);
                if (version === 'latest') {
                    return avail.slice(-1);
                }

                // split version string on two dots to see if range was specified
                var split = version.split('..');

                // range specified via ##..##
                if (split.length === 2) {
                    var start = split[0] - 0;
                    var end = split[1];
                    return avail.filter(function(browser) {
                        if (end === 'latest') {
                            return browser.version >= start;
                        }

                        end = end - 0;
                        return browser.version >= start && browser.version <= end;
                    });
                }

                return avail.filter(function(browser) {
                    return browser.version == version;
                });
            }
        });

        cb(null, browsers);
    });
}

module.exports = expand_browsers;
