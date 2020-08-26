#!/usr/bin/env node
'use strict'

if (process.version.match(/^v(\d+)\./)[1] < 10) {
  console.error('airtap: Node 10 or greater is required. `airtap` did not run.')
  process.exit(0)
}

require('make-promises-safe')

const program = require('commander')
const nearest = require('find-nearest-file')
const yaml = require('js-yaml')
const os = require('os')
const fs = require('fs')
const path = require('path')
const Airtap = require('../lib/airtap')
const version = require('../package.json').version
const hasOwnProperty = Object.prototype.hasOwnProperty

program
  .version(version, '-v, --version', 'print version')
  .usage('[options] <files>')
  .option('-l, --list-browsers', 'list (effective or --all) browsers')
  .option('-a, --all', 'test or list all available browsers')
  .option('-c, --concurrency <n>', 'number of browsers to test concurrently, default 5')
  .option('-r, --retries <retries>', 'number of retries when running a browser, default 6')
  .option('-t, --timeout <timeout>', 'how long to wait for test results, default 5m')
  .option('--coverage', 'enable code coverage analysis')
  .option('--live', 'keep browsers open to allow repeated test runs')
  .option('-p, --preset <preset>', 'select a configuration preset')
  .option('-s, --server <script>', 'path to script that runs a support server')
  .option('--loopback <hostname>', 'custom hostname that equals or resolves to 127.0.0.1')
  .option('--verbose', 'enable airtap debug output')
  .option('--silly', 'enable all debug output')

  // Can we hide these in help?
  .option('--local', 'n/a')
  .option('--open', 'n/a')
  .option('--electron', 'n/a')

  .on('--help', function () {
    console.log()
    console.log(read('examples.txt'))
  })
  .parse(process.argv)

const config = {
  watchify: !process.env.CI,
  ...readYAML(nearest('.airtaprc') || path.join(os.homedir(), '.airtaprc')),
  ...readYAML('.airtap.yml'),
  ...wash(program.opts())
}

if (program.preset) {
  usePreset(config, program.preset)
}

if (config.silly) {
  require('debug').enable('*,-babel')
} else if (config.verbose) {
  require('debug').enable('airtap*')
}

// Reject flags that have been removed in airtap 4
if (config.local && config.open) {
  fail(read('no-local-open.txt'), true)
} else if (config.local) {
  fail(read('no-local.txt'), true)
} else if (config.electron) {
  fail(read('no-electron.txt'), true)
}

// Take credentials from root config for airtap < 4 compatibility
// TODO: remove in next major. Can be specified via env or provider options.
setCredentials(config, process.env)

const airtap = new Airtap()
const wanted = config.all ? null : config.browsers || []
const files = program.args.length ? program.args : config.files || []

if (!config.providers) {
  config.providers = ['airtap-default']
  if (wanted) wanted.splice(0, wanted.length, { name: 'default' })
}

if (!files.length && !program.listBrowsers) {
  fail('At least one file must be specified.', true)
} else if (!config.providers.length) {
  fail(read('no-input.txt'), true)
} else if (wanted && !wanted.length) {
  fail(read('no-input.txt'), true)
}

// Load providers
airtap.provider(config.providers)

// Match provider manifests against wanted manifests
airtap.manifests(wanted, function (err, manifests) {
  if (err) return fail(err)

  if (program.listBrowsers) {
    manifests.forEach(simplifyManifest)
    console.log(toYAML(manifests))
    return
  }

  airtap.test(manifests, files, config)
    .on('error', fail)
    .on('context', function (context) {
      // Emits one session or more (on page reload)
      context.on('session', function (session) {
        // TODO (later): merge TAP from multiple sessions
        session.pipe(process.stdout, { end: false })
      })
    })
    .on('complete', function (stats) {
      console.log('# %d of %d browsers ok', stats.pass, stats.count)
      process.exit(stats.ok ? 0 : 1)
    })
})

function fail (err, expected) {
  if (err.expected || expected) {
    if (err.code === 'ERR_MANIFEST_NOT_FOUND') {
      const isEmpty = Object.keys(err.input).length === 0
      const wanted = isEmpty ? '<empty>' : toYAML(err.input)

      console.error('No manifest found matching:\n\n%s', indent(wanted))
    } else {
      console.error(err.message || err)
    }

    process.exit(err.exitCode || 1)
  }

  throw err
}

function readYAML (fp) {
  try {
    return yaml.safeLoad(fs.readFileSync(fp, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') fail(err)
  }
}

function toYAML (value) {
  return yaml.safeDump(value, { noRefs: true }).trim()
}

function indent (str) {
  return '  ' + str.replace(/\r?\n/g, '\n  ')
}

function wash (opts) {
  const copy = {}

  for (const k in opts) {
    if (!hasOwnProperty.call(opts, k)) continue
    if (opts[k] != null) copy[k] = opts[k]
  }

  return copy
}

function usePreset (config, preset) {
  const presets = config.presets
  const overrides = presets && presets[preset]

  if (typeof presets !== 'object' || presets === null) {
    return fail('No presets are available', true)
  } else if (typeof overrides !== 'object' || overrides === null) {
    return fail(`Preset '${preset}' not found`, true)
  }

  for (const k in overrides) {
    if (k === 'presets') continue
    if (!hasOwnProperty.call(overrides, k)) continue

    config[k] = overrides[k]
  }
}

function setCredentials (config, env) {
  const username = config.sauce_username || config.username
  const key = config.sauce_key || config.sauce_access_key || config.key

  if (username || key) console.error(read('deprecated-creds.txt'))
  if (username && !env.SAUCE_USERNAME) env.SAUCE_USERNAME = username
  if (key && !env.SAUCE_ACCESS_KEY) env.SAUCE_ACCESS_KEY = key
}

function simplifyManifest (m) {
  // Remove irrelevant properties, to ease copy-pasting into airtap.yml.
  if (Object.keys(m.supports).length === 0) delete m.supports
  if (Object.keys(m.wants).length === 0) delete m.wants
  if (Object.keys(m.options).length === 0) delete m.options
}

function read (filename) {
  const fp = path.join(__dirname, filename)
  return fs.readFileSync(fp, 'utf8').trim()
}
