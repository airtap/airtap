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
  this._start()
}

inherits(AbstractBrowser, EventEmitter)

module.exports = AbstractBrowser
