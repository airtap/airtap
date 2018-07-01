'use strict'

var path = require('path')
var fs = require('fs')
var crypto = require('crypto')
var mkdirp = require('mkdirp')

module.exports = function middleware (opts) {
  // TODO: rimraf basedir/* (but just once)
  var basedir = path.resolve(opts.basedir)
  var prefix = opts.prefix || ''

  return function (req, res, next) {
    var coverage = req.body

    if (typeof coverage !== 'object' || Object.keys(coverage).length === 0) {
      res.status(400)
      return res.end()
    }

    var json = JSON.stringify(coverage)
    var name = opts.name || crypto.createHash('sha1').update(json).digest('hex')
    var fp = path.join(basedir, prefix + name + '.json')

    mkdirp(basedir, function (err) {
      if (err) return next(err)

      fs.writeFile(fp, json, function (err) {
        if (err) return next(err)

        res.status(201)
        res.end()
      })
    })
  }
}
