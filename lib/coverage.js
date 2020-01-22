'use strict'

const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const prefix = 'airtap-'

exports.write = function (cwd, coverage, callback) {
  if (!coverage || Object.keys(coverage).length === 0) {
    return process.nextTick(callback)
  }

  const dir = basedir(cwd)
  const json = JSON.stringify(coverage)
  const digest = crypto.createHash('sha1').update(json).digest('hex')
  const fp = path.join(dir, prefix + digest + '.json')

  fs.mkdir(dir, { recursive: true }, function (err) {
    if (err) return callback(err)
    fs.writeFile(fp, json, callback)
  })
}

exports.clean = function (cwd) {
  const dir = basedir(cwd)

  for (const file of readdirSync(dir)) {
    if (file.startsWith(prefix)) {
      unlinkSync(path.join(dir, file))
    }
  }
}

function basedir (cwd) {
  return path.join(cwd, '.nyc_output')
}

function readdirSync (dir) {
  try {
    return fs.readdirSync(dir)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      process.emitWarning(err, 'AirtapWarning')
    }

    return []
  }
}

function unlinkSync (fp) {
  try {
    fs.unlinkSync(fp)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      process.emitWarning(err, 'AirtapWarning')
    }
  }
}
