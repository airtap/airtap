// given a list of browsers we want to test
// expand into an actual testable list of browsers
// @param {Array} request array of { name: 'chrome', version: <version str>, platform: <os> }
// @param {Object} supported browsers and versions
// @return {Array} browsers to test { name: <browser name>, version: <version>, platform: <os> }
function flatten(request, all_browsers, cb) {
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
            else if (version === 'oldest') {
                return avail.slice(0, 1);
            }

            // split version string on two dots to see if range was specified
            var split = version.split('..');

            // range specified via ##..##
            if (split.length === 2) {
                var start = split[0];
                var end = split[1];

                if (start === 'oldest') {
                    start = avail[0].version;
                }

                if (end === 'latest') {
                    end = avail.slice(-1)[0].version;
                }

                start = start - 0;
                end = end - 0;

                if (start == end) {
                    return [start];
                }

                return avail.filter(function(browser) {
                    return browser.version >= start && browser.version <= end;
                });
            }

            return avail.filter(function(browser) {
                return browser.version == version;
            });
        }
    });

    return browsers;
}

module.exports = flatten;
