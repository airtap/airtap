var uniq = require('lodash').uniq

// given a list of browsers we want to test
// expand into an actual testable list of browsers
// @param {Array} request array of { name: 'chrome', version: <version str>, platform: <os> }
// @param {Object} supported browsers and versions
// @return {Array} browsers to test { name: <browser name>, version: <version>, platform: <os> }
function flatten (request, allBrowsers) {
  var browsers = []

  // turn each browser request into an array of valid browsers
  request.forEach(function (req) {
    if (!allBrowsers[req.name]) {
      return
    }
    // clone because we will modify to filter down
    var avail = allBrowsers[req.name].slice(0)

    if (req.platform && typeof req.platform === 'string') {
      avail = avail.filter(function (browser) {
        return req.platform.toLowerCase() === browser.platform.toLowerCase()
      })
    } else if (req.platform && Array.isArray(req.platform)) {
      req.platform = req.platform.map(function (platform) {
        return platform.toLowerCase()
      })

      avail = avail.filter(function (browser) {
        return req.platform.indexOf(browser.platform.toLowerCase()) > -1
      })
    }

    if (avail.length === 0) {
      return
    }

    // sort version entries putting 'beta' last
    avail = avail.sort(function (a, b) {
      if (a.version === b.version) {
        return 0
      } else if (Number.isNaN(Number(a.version))) {
        return 1
      } else if (Number.isNaN(Number(b.version))) {
        return -1
      }
      return a.version - b.version
    })

    // remove duplicate version entries
    // because we are not interested in testing on all platforms
    // unless explicitly asked
    if (!req.platform) {
      avail.reduce(function (prev, curr, idx, arr) {
        if (prev && prev.version === curr.version) {
          arr[idx] = undefined
        }
        return curr
      })
    }

    avail = avail.filter(Boolean)

    // version is an array, we should add each item from array
    if (Array.isArray(req.version)) {
      return req.version.forEach(function (version) {
        browsers.push.apply(browsers, processVersionString(version))
      })
    }

    browsers.push.apply(browsers, processVersionString(req.version))

    // return an array of browsers to match version string
    // version string can be a single version
    // or a range ##..##
    // or ##..latest
    function processVersionString (version) {
      version = String(version)
      if (version === 'latest') {
        if (Array.isArray(req.platform)) {
          var latest = getNumericVersions(avail).slice(-1)[0].version
          return avail.filter(function (browser) {
            return browser.version === latest
          })
        } else {
          return getNumericVersions(avail).slice(-1).map(addProfile)
        }
      } else if (version === 'oldest') {
        if (Array.isArray(req.platform)) {
          var oldest = getNumericVersions(avail).slice(0, 1)[0].version
          return avail.filter(function (browser) {
            return browser.version === oldest
          })
        } else {
          return avail.slice(0, 1).map(addProfile)
        }
      }

      // split version string on two dots to see if range was specified
      var split = version.split('..')

      // range specified via ##..##
      if (split.length === 2) {
        var start = split[0]
        var end = split[1]
        var startIndex = 0
        var endIndex = avail.length - 1
        var versions = avail.map(function (item) { return item.version })

        if (end === 'latest') {
          endIndex = getNumericVersions(avail).length - 1
        } else {
          endIndex = versions.lastIndexOf(end)
        }

        if (start < 0) {
          startIndex = endIndex + Number(start)
        } else if (start !== 'oldest') {
          startIndex = versions.indexOf(start)
        }

        if (startIndex < 0) {
          throw new Error('unable to find start version: ' + start)
        } else if (endIndex < 0) {
          throw new Error('unable to find end version: ' + end)
        }

        return avail.slice(startIndex, endIndex + 1).map(addProfile)
      }

      return avail.filter(function (browser) {
        // JS will forget about the .0 when reading any float that can
        // be represented as an integer from yaml, so let's try to
        // match a version of that form as a fallback
        return browser.version === version || browser.version === version + '.0'
      }).map(addProfile)

      function getNumericVersions (browsers) {
        return browsers.filter(function (el) {
          return Number(el.version) >= 0
        })
      }

      function addProfile (browser) {
        if (req.firefox_profile) {
          return Object.assign({}, browser, {
            firefox_profile: req.firefox_profile
          })
        }

        return browser
      }
    }
  })

  return uniq(browsers)
}

module.exports = flatten
