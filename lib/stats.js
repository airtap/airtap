'use strict'

const kOk = Symbol('kOk')

module.exports = class Stats {
  constructor (ok, pass, fail) {
    this[kOk] = ok
    this.pass = pass
    this.fail = fail
  }

  get ok () {
    return this[kOk] && this.fail === 0
  }

  set ok (value) {
    this[kOk] = value
  }

  get count () {
    return this.pass + this.fail
  }
}
