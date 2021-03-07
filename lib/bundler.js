'use strict'

const browserify = require('browserify')
const istanbul = require('@airtap/browserify-istanbul')
const deglob = require('globs-to-files')
const debug = require('debug')('airtap:browserify')
const watchifyOptions = require('./watchify-options')

module.exports = function (files, cwd, configs, coverage) {
  configs = configs || []

  let options = {
    debug: true,
    basedir: cwd,
    ...watchifyOptions()
  }

  for (const cfg of configs) {
    const key = Object.keys(cfg)[0]

    if (key === 'options') {
      options = { ...options, ...cfg.options }
    }
  }

  const bundler = browserify(options)

  for (const cfg of configs) {
    const key = Object.keys(cfg)[0]

    if (key !== 'options') {
      const { [key]: arg1, ...rest } = cfg
      bundler[key](arg1, rest)
    }
  }

  if (coverage) {
    bundler.transform(istanbul({
      defaultIgnore: true
    }))
  }

  for (const file of deglob.sync(files, { cwd })) {
    debug('file %o', file)
    bundler.require(file, { entry: true })
  }

  return bundler
}
