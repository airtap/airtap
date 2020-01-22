'use strict'

const parallel = require('run-parallel-settled')
const Collection = require('nanoresource-collection')
const Nanoresource = require('nanoresource')

const kProviders = Symbol('kProviders')
const kDomains = Symbol('kDomains')
const kCollection = Symbol('kCollection')

// Launch a tunnel per provider (if supported) for browsers that want it
module.exports = class Tunnels extends Nanoresource {
  constructor (multiProvider, manifests, loopback) {
    super()

    const wanted = manifests.filter(m => m.wants.tunnel)
    const ids = new Set(wanted.map(m => m.provider))

    this[kProviders] = Array.from(ids).map(id => multiProvider.get(id))
    this[kDomains] = ['localhost', 'airtap.local']
    this[kCollection] = null

    if (loopback && !this[kDomains].includes(loopback)) {
      this[kDomains].push(loopback)
    }
  }

  _open (callback) {
    if (this[kProviders].length === 0) {
      return callback()
    }

    // Group tunnels into collection that is closed as one
    this[kCollection] = new Collection({ opened: true })

    const tasks = this[kProviders].map(provider => next => {
      provider.tunnel({ domains: this[kDomains] }, (err, tunnel) => {
        if (err) return next(err)
        if (tunnel) this[kCollection].push(tunnel)

        next()
      })
    })

    parallel(tasks, 4, (err) => {
      if (err) return this[kCollection].destroy(err, callback)
      callback()
    })
  }

  _close (callback) {
    if (this[kCollection] === null) {
      callback()
    } else {
      this[kCollection].close(callback)
    }
  }
}
