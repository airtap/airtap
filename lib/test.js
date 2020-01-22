'use strict'

const EventEmitter = require('events')
const Stats = require('./stats')

module.exports = class Test extends EventEmitter {
  constructor () {
    super()

    this.stats = new Stats(true, 0, 0)
    this.destroyed = false
  }

  aggregate (stats) {
    if (stats.ok) this.stats.pass++
    else this.stats.fail++
  }

  complete () {
    if (this.destroyed) return
    this.emit('complete', this.stats)
    this.destroy()
  }

  destroy (err) {
    if (this.destroyed) return
    this.destroyed = true

    if (err) {
      this.emit('error', err)
    }

    process.nextTick(() => {
      this.emit('close')
    })
  }
}
