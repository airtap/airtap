'use strict'

const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits

function AbstractBrowser () {
  if (!(this instanceof AbstractBrowser)) {
    return new AbstractBrowser()
  }

  EventEmitter.call(this)
}

inherits(AbstractBrowser, EventEmitter)

module.exports = AbstractBrowser
