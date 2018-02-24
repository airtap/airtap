'use strict'

const _ = require('lodash')

function aggregate (allBrowsers) {
  return Object.keys(allBrowsers).map(function (browser) {
    const versions = _.uniq(_.map(allBrowsers[browser], 'version')).sort(function (a, b) {
      const aNum = Number(a)
      const bNum = Number(b)

      if (aNum && !bNum) {
        return -1
      } else if (!aNum && bNum) {
        return 1
      } else if (a === b) {
        return 0
      } else if (aNum > bNum) {
        return 1
      }

      return -1
    })

    const platforms = _.sortBy(_.uniq(_.map(allBrowsers[browser], 'platform')))

    return { browser, versions, platforms }
  })
}

module.exports = aggregate
