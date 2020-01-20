'use strict'

const open = require('opener')
const inherits = require('util').inherits
const AbstractBrowser = require('./abstract-browser')

function LocalBrowser (config) {
  if (!(this instanceof LocalBrowser)) {
    return new LocalBrowser(config)
  }

  AbstractBrowser.call(this, config)
}

inherits(LocalBrowser, AbstractBrowser)

LocalBrowser.prototype.toString = function () {
  return 'local'
}

LocalBrowser.prototype._start = function (url, callback) {
  if (this.config.open) {
    open(url)
  } else {
    console.error('open the following url in a browser:')
    console.error(url)
  }

  process.nextTick(callback)
}

module.exports = LocalBrowser
