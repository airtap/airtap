'use strict'

const _ = require('lodash')
const browserify = require('browserify')
const istanbul = require('browserify-istanbul')
const debug = require('debug')('airtap:browserify')
const watchifyOptions = require('./watchify-options')

function configure (bundler, cfg) {
  if (!cfg) {
    return
  }

  var registerableCfg = [
    'plugin',
    'external',
    'ignore',
    'exclude',
    'transform',
    'add',
    'require'
  ]

  cfg.forEach(registerable)

  // grab registerable configs and register them
  function registerable (cfgObj) {
    _.forIn(cfgObj, function (value, key) {
      if (registerableCfg.indexOf(key) !== -1) {
        register(key, cfgObj)
      }
    })
  }

  function register (type, o) {
    debug('registering %s: %s', type, o[type])
    if (type === 'transform' && typeof o[type] === 'object') {
      bundler[type](o[type].name, _.omit(o[type], 'name'))
    } else {
      bundler[type](o[type], _.omit(o, type))
    }
  }
}

module.exports = function createTestBundler (files, config) {
  const userConfig = _.find(config.browserify, 'options')
  const opts = {
    debug: true,
    basedir: config.prj_dir,
    ...watchifyOptions()
  }

  if (userConfig && userConfig.options) {
    Object.assign(opts, userConfig.options)
  }

  const bundler = browserify(opts)

  debug('configuring browserify with provided options: %O', config.browserify)
  configure(bundler, config.browserify)

  if (config.coverage) {
    debug('using istanbul transform')
    bundler.transform(istanbul({
      defaultIgnore: true
    }))
  }

  debug('adding to bundle: %o', files)
  files.forEach(function (file) {
    bundler.require(file, { entry: true })
  })

  return bundler
}
