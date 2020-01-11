'use strict'

function aggregate (arr) {
  const browsers = {}
  arr.forEach(function (info) {
    const name = info.api_name

    const browser = browsers[name] = browsers[name] || []
    browser.push({
      name: name,
      version: info.short_version,
      platform: info.os
    })
  })

  return Object.keys(browsers).map(function (name) {
    const versions = browsers[name].map(function (browser) {
      return browser.version
    }).sort(function (a, b) {
      if (isNaN(a)) return isNaN(b) ? a.localeCompare(b) : 1
      if (isNaN(b)) return -1
      return Number(a) - Number(b)
    })

    const platforms = browsers[name].map(function (browser) {
      return browser.platform
    }).sort()

    return {
      browser: name,
      versions: Array.from(new Set(versions)),
      platforms: Array.from(new Set(platforms))
    }
  })
}

module.exports = aggregate
