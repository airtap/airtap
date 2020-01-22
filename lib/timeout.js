'use strict'

const humanizeDuration = require('humanize-duration')

exports.optional = function (fn, ms) {
  if (ms > 0 && ms < Infinity) {
    return setTimeout(fn, ms)
  }
}

exports.Error = class TimeoutError extends Error {
  constructor (message, ms) {
    super(`${message} (${humanizeDuration(ms)})`)

    Object.defineProperty(this, 'name', { value: 'TimeoutError' })
    Object.defineProperty(this, 'expected', { value: true })
  }
}
