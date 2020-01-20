'use strict'

module.exports = function (err) {
  Object.defineProperty(err, 'recoverable', {
    value: true
  })

  return err
}
