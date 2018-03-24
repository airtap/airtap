'use strict'

const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits

function AbstractBrowser () {
  if (!(this instanceof AbstractBrowser)) {
    return new AbstractBrowser()
  }

  EventEmitter.call(this)
}

AbstractBrowser.prototype.start = function () {
  this.stats = { passed: 0, failed: 0 }
  this._start()
}

AbstractBrowser.prototype._start = function () {}

inherits(AbstractBrowser, EventEmitter)

module.exports = AbstractBrowser
