var xtend = require('xtend');

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

        if (avail.length === 0) {
            return;
        }

        // remove duplicate version entries
        avail.reduce(function(prev, curr, idx, arr) {
            if (prev && prev.version === curr.version) {
                arr[idx] = undefined;
            }
            return curr;
        });

        avail = avail.filter(Boolean);

        // sort version entries putting 'beta' last always
        avail = avail.sort(function(a, b) {
            if (a.version === 'beta') {
                return 1;
            } else {
                return (parseInt(a.version, 10) - parseInt(b.version, 10));
            }
        });

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
                return getNumericVersions(avail).slice(-1).map(addProfile);
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

                if (start === 'oldest') {
                    start = avail[0].version;
                }

                if (end === 'latest') {
                    end = getNumericVersions(avail).slice(-1)[0].version;
                }

                start = start - 0;
                end = end - 0;

                if (start == end) {
                    return [start].map(addProfile);
                }

                return avail.filter(function(browser) {
                    return browser.version >= start && browser.version <= end;
                }).map(addProfile);
            }

            return avail.filter(function(browser) {
                return browser.version == version;
            }).map(addProfile);

            function getNumericVersions(browsers) {
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
                else {
                    return browser;
                }
            }
        }
    });

    return browsers;
}

module.exports = flatten;
