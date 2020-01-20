#!/usr/bin/env node

var messages = require('../lib/messages')

// Prevent external PRs of airtap users to fail browser tests
if (process.env.TRAVIS_SECURE_ENV_VARS === 'false') {
  console.error(messages.SKIPPING_AIRTAP)
  process.exit(0)
}

var path = require('path')
var fs = require('fs')

var chalk = require('chalk')
var program = require('commander')
var yaml = require('yamljs')
var os = require('os')
var ms = require('ms')
var findNearestFile = require('find-nearest-file')
var sauceBrowsers = require('sauce-browsers/callback')

var Airtap = require('../lib/airtap')
var aggregate = require('../lib/aggregate-browsers')
var SauceBrowser = require('../lib/sauce-browser')
var ElectronBrowser = require('../lib/electron-browser')
var LocalBrowser = require('../lib/local-browser')

program
  .version(require('../package.json').version)
  .usage('[options] <files | dir>')
  .option('--local', 'run tests in a local browser of choice')
  .option('--live', 'keep browser open to allow repeated test runs')
  .option('--port <port>', 'port for bouncer server, defaults to a free port')
  .option('--electron', 'run tests in electron. electron must be installed separately.')
  .option('--tunnel-id <id>', 'Tunnel identifier for Sauce Connect, default TRAVIS_JOB_NUMBER or none')
  .option('--loopback <host name>', 'hostname to use instead of localhost, to accomodate Safari and Edge with Sauce Connect. Must resolve to 127.0.0.1')
  .option('--server <the server script>', 'specify a server script to be run')
  .option('-l, --list-browsers', 'list available browsers and versions')
  .option('--browser-name <browser name>', 'specficy the browser name to test an individual browser')
  .option('--browser-version <browser version>', 'specficy the browser version to test an individual browser')
  .option('--browser-platform <browser platform>', 'specficy the browser platform to test an individual browser')
  .option('--browser-retries <retries>', 'number of retries allowed when trying to start a cloud browser, default to 6')
  .option('--idle-timeout <timeout>', 'how much time to wait before and between test results, default "5m"')
  .option('--concurrency <n>', 'specify the number of concurrent browsers to test')
  .option('--coverage', 'enable code coverage analysis with istanbul')
  .option('--open', 'open a browser automatically. only used when --local is specified')
  .parse(process.argv)

// TODO: camelCase, across the board
var config = {
  files: program.args,
  local: program.local,
  live: program.live,
  port: program.port,
  electron: program.electron,
  prj_dir: process.cwd(),
  tunnel_id: program.tunnelId,
  loopback: program.loopback,
  server: program.server,
  concurrency: program.concurrency,
  coverage: program.coverage,
  open: program.open,
  browser_retries: program.browserRetries,
  idle_timeout: program.idleTimeout
}

// Remove unspecified flags
for (var key in config) {
  if (typeof config[key] === 'undefined') {
    delete config[key]
  }
}

if (program.listBrowsers) {
  sauceBrowsers(function (err, allBrowsers) {
    if (err) {
      console.error(chalk.bold.red('Unable to get available browsers for saucelabs'))
      console.error(chalk.red(err.stack))
      return process.exit(1)
    }
    aggregate(allBrowsers).forEach(function (i) {
      console.log(i.browser)
      console.log('   Versions: ' + i.versions.join(', '))
      console.log('   Platforms: ' + i.platforms.join(', '))
    })
  })
} else if (config.files.length === 0) {
  console.error(chalk.red(messages.NO_FILES))
  process.exit(1)
} else if ((program.browserVersion || program.browserPlatform) && !program.browserName) {
  console.error(chalk.red('the browser name needs to be specified (via --browser-name)'))
  process.exit(1)
} else if ((program.browserName || program.browserPlatform) && !program.browserVersion) {
  console.error(chalk.red('the browser version needs to be specified (via --browser-version)'))
  process.exit(1)
} else {
  config = readLocalConfig(config)

  // Overwrite browsers from command line arguments
  if (program.browserName) {
    Object.assign(config, { browsers: [{ name: program.browserName, version: program.browserVersion, platform: program.browserPlatform }] })
  }

  config = readGlobalConfig(config)
  config.sauce_username = process.env.SAUCE_USERNAME || config.sauce_username
  config.sauce_key = process.env.SAUCE_ACCESS_KEY || config.sauce_key
  config.browser_retries = parseInt(config.browser_retries || 6, 10)
  config.idle_timeout = parseDuration(config.idle_timeout || '5m')
  config.concurrency = parseInt(config.concurrency || 5, 10)

  var pkg = {}
  try {
    pkg = require(process.cwd() + '/package.json')
  } catch (err) {}

  config.name = config.name || pkg.name || 'airtap'
  config.watchify = !process.env.CI

  var airtap = Airtap(config)

  if (config.local || config.electron) {
    if (config.local) airtap.add(new LocalBrowser(config))
    if (config.electron) airtap.add(new ElectronBrowser(config))

    // TODO: first add sauce browsers (if any), then run
    run(airtap)
  } else if (!config.sauce_username || !config.sauce_key) {
    console.error(chalk.red('Airtap tried to run tests in Sauce Labs, however no credentials were provided.'))
    console.error(chalk.red('See doc/cloud-testing.md for info on how to setup cloud testing.'))
    process.exit(1)
  } else if (!config.browsers) {
    console.error(chalk.red('No cloud browsers specified in .airtap.yml'))
    process.exit(1)
  } else {
    sauceBrowsers(config.browsers, function (err, toTest) {
      if (err) {
        console.error(chalk.red('Unable to get available browsers for Sauce Labs'))
        console.error(chalk.red(err.stack))
        return process.exit(1)
      }

      const byOs = {}

      toTest.forEach(function (info) {
        const key = info.api_name + ' @ ' + info.os;
        (byOs[key] = byOs[key] || []).push(info.short_version)

        airtap.add(new SauceBrowser(config, {
          browserName: info.api_name,
          version: info.short_version,
          platform: info.os,

          // TODO: broken, sauce-browsers doesn't preserve custom properties
          firefox_profile: info.firefox_profile
        }))
      })

      // pretty prints which browsers we will test on what platforms
      // TODO: do we really need this?
      for (const item in byOs) {
        console.error(chalk.gray(`# testing ${item}: ${byOs[item].join(' ')}`))
      }

      run(airtap)
    })
  }
}

function run (airtap) {
  monitor(airtap)

  airtap.run(function (err, ok) {
    if (err) throw err
    process.exit(ok ? 0 : 1)
  })
}

function monitor (airtap) {
  for (const browser of airtap) {
    let waitTimer

    browser.on('message', function (msg) {
      // TODO (!!): reset waitTimer

      if (msg.type === 'console') {
        if (msg.level === 'log') {
          // Only use stdout for TAP
          // IDEA: merge TAP output of multiple browsers. Then you can pipe
          // airtap into the usual TAP reporters. Per browser, we'll have
          // two TAP streams: one for state changes (start/stop/waiting) and
          // one for the browser output (which may repeat itself, in case of
          // retries). We'll aggregate the plans of all streams, and emit a
          // total at the end.
          console.log(...msg.args)
        } else {
          console.error(...msg.args)
        }
      } else if (msg.type === 'error') {
        const { type, ...rest } = msg
        console.error(chalk.red(`# ${browser} window error`), rest)
      }
    })

    browser.on('starting', function (url) {
      console.error(chalk.yellow(`# ${browser} starting ${url}`))
    })

    browser.on('stopping', function () {
      console.error(chalk.yellow(`# ${browser} stopping`))
    })

    browser.on('start', function () {
      console.error(chalk.yellow(`# ${browser} started`))

      clearInterval(waitTimer)
      waitTimer = setInterval(function () {
        console.error(chalk.yellow(`# ${browser} waiting`))
      }, 30e3)
    })

    browser.on('stop', function (err, stats) {
      clearInterval(waitTimer)

      if (err) {
        console.error(chalk.red(`# ${browser} error: ${err.message}`))
      } else if (!stats.ok) {
        console.error(chalk.red(`# ${browser} failed: pass ${stats.pass}, fail ${stats.fail}`))
      } else {
        console.error(chalk.green(`# ${browser} passed: pass ${stats.pass}, fail ${stats.fail}`))
      }
    })

    browser.on('restart', function () {
      clearInterval(waitTimer)
      console.error(chalk.yellow(`# ${browser} restarting`))
    })
  }
}

function readLocalConfig (config) {
  var yaml = path.join(process.cwd(), '.airtap.yml')
  var js = path.join(process.cwd(), 'airtap.config.js')
  var yamlExists = fs.existsSync(yaml)
  var jsExists = fs.existsSync(js)
  if (yamlExists && jsExists) {
    console.error(chalk.red('Both `.airtap.yaml` and `airtap.config.js` are found in the project directory, please choose one'))
    process.exit(1)
  } else if (yamlExists) {
    return mergeConfig(config, readYAMLConfig(yaml))
  } else if (jsExists) {
    return mergeConfig(config, require(js))
  }
  return config
}

function readGlobalConfig (config) {
  var filename = findNearestFile('.airtaprc') || path.join(os.homedir(), '.airtaprc')
  if (fs.existsSync(filename)) {
    var globalConfig
    try {
      globalConfig = require(filename)
    } catch (_err) {
      globalConfig = readYAMLConfig(filename)
    }
    return mergeConfig(config, globalConfig)
  }
  return config
}

function readYAMLConfig (filename) {
  return yaml.parse(fs.readFileSync(filename, 'utf-8'))
}

function mergeConfig (config, update) {
  config = Object.assign({}, update, config)
  return config
}

function parseDuration (d) {
  return typeof d === 'number' ? d : ms(d)
}
