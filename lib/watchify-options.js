'use strict'

// Get browserify options required for watchify
module.exports = function () {
  return {
    cache: {},
    packageCache: {},
    fullPaths: true
  }
}
