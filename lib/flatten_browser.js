var xtend = require('xtend');

// given a list of browsers we want to test
// expand into an actual testable list of browsers
// @param {Array} request array of { name: 'chrome', version: <version str>, platform: <os> }
// @param {Object} supported browsers and versions
// @return {Array} browsers to test { name: <browser name>, version: <version>, platform: <os> }
function flatten(request, all_browsers) {
    var browsers = [];

    // turn each browser request into an array of valid browsers
    request.forEach(function(req) {
        if (!all_browsers[req.name]) {
            return;
        }
        // clone because we will modify to filter down
        var avail = all_browsers[req.name].slice(0);

        if (req.platform) {
            avail = avail.filter(function(browser) {
                return req.platform.toLowerCase() === browser.platform.toLowerCase()
            });
        }

        if (avail.length === 0) {
            return;
        }

        // sort version entries putting 'beta' last
        avail = avail.sort(function(a, b) {
            if (a.version === b.version) {
                return 0;
            }
            else if (Number.isNaN(Number(a.version))) {
                return 1;
            }
            else if (Number.isNaN(Number(b.version))) {
                return -1;
            }
            return a.version - b.version;
        });

        // remove duplicate version entries
        // because we are not interested in testing on all platforms
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
                return get_numeric_versions(avail).slice(-1).map(addProfile);
            }
            else if (version === 'oldest') {
                return avail.slice(0, 1).map(addProfile);
            }

            // split version string on two dots to see if range was specified
            var split = version.split('..');

            // range specified via ##..##
            if (split.length === 2) {
                var start = split[0];
                var end = split[1];

                var start_idx = 0;
                var end_idx = avail.length - 1;

                var v_map = avail.map(function(item) {
                    return item.version;
                });

                if (start !== 'oldest') {
                    start_idx = v_map.indexOf(start);
                }

                if (end === 'latest') {
                    end_idx = get_numeric_versions(avail).length - 1;
                }
                else {
                    end_idx = v_map.lastIndexOf(end);
                }

                if (start_idx < 0) {
                    throw new Error('unable to find start version: ' + start);
                }
                else if (end_idx < 0) {
                    throw new Error('unable to find end version: ' + end);
                }

                return avail.slice(start_idx, end_idx + 1).map(addProfile);
            }

            return avail.filter(function(browser) {
                return browser.version == version;
            }).map(addProfile);

            function get_numeric_versions(browsers) {
                return browsers.filter(function (el) {
                    return Number(el.version) >= 0;
                })
            }

            function addProfile(browser) {
                if (req.firefox_profile) {
                    return xtend(browser, {
                        firefox_profile: req.firefox_profile
                    });
                }

                return browser;
            }
        }
    });

    return browsers;
}

module.exports = flatten;
