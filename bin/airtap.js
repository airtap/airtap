#!/usr/bin/env node

var messages = require('../lib/messages')

// Prevent external PRs of airtap users to fail browser tests
if (process.env.TRAVIS_SECURE_ENV_VARS === 'false') {
  console.log(messages.SKIPPING_AIRTAP)
  process.exit(0)
}

var path = require('path')
var fs = require('fs')

var chalk = require('chalk')
var program = require('commander')
var yaml = require('yamljs')
var os = require('os')
var findNearestFile = require('find-nearest-file')
var sauceBrowsers = require('sauce-browsers/callback')
var open = require('opener')

var Airtap = require('../lib/airtap')
var aggregate = require('../lib/aggregate-browsers')

program
  .version(require('../package.json').version)
  .usage('[options] <files | dir>')
  .option('--local', 'run tests in a local browser of choice')
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
  .option('--browser-output-timeout <timeout>', 'how much time to wait between two test results, default to -1 (no timeout)')
  .option('--concurrency <n>', 'specify the number of concurrent browsers to test')
  .option('--coverage', 'enable code coverage analysis with istanbul')
  .option('--open', 'open a browser automatically. only used when --local is specified')
  .parse(process.argv)

var config = {
  files: program.args,
  local: program.local,
  port: program.port,
  electron: program.electron,
  prj_dir: process.cwd(),
  tunnel_id: program.tunnelId,
  loopback: program.loopback,
  server: program.server,
  concurrency: program.concurrency,
  coverage: program.coverage,
  open: program.open,
  browser_retries: program.browserRetries && parseInt(program.browserRetries, 10),
  browser_output_timeout: program.browserOutputTimeout && parseInt(program.browserOutputTimeout, 10),
  browser_open_timeout: program.browserOpenTimeout && parseInt(program.browserOpenTimeout, 10)
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
  config.username = process.env.SAUCE_USERNAME || config.sauce_username
  config.key = process.env.SAUCE_ACCESS_KEY || config.sauce_key

  var pkg = {}
  try {
    pkg = require(process.cwd() + '/package.json')
  } catch (err) {}

  config.name = config.name || pkg.name || 'airtap'
  config.watchify = !process.env.CI

  if (config.builder) {
    // relative path will needs to be under project dir
    if (config.builder[0] === '.') {
      config.builder = path.resolve(config.prj_dir, config.builder)
    }

    config.builder = require.resolve(config.builder)
  }

  var airtap = Airtap(config)

  if (config.local) {
    airtap.run(function (err, url) {
      if (err) throw err

      if (config.open) {
        open(url)
      } else {
        console.log('open the following url in a browser:')
        console.log(url)
      }
    })
  } else if (config.electron) {
    airtap.run(function (err, passed) {
      if (err) throw err
      process.exit(passed ? 0 : 1)
    })
  } else if (!config.username || !config.key) {
    console.error(chalk.red('Error:'))
    console.error(chalk.red('Airtap tried to run tests in Sauce Labs, however no credentials were provided.'))
    console.error(chalk.cyan('See doc/cloud-testing.md for info on how to setup cloud testing.'))
    process.exit(1)
  } else if (!config.browsers) {
    console.error(chalk.red('No cloud browsers specified in .airtap.yml'))
    process.exit(1)
  } else {
    sauceBrowsers(config.browsers, function (err, toTest) {
      if (err) {
        console.error(chalk.bold.red('Unable to get available browsers for Sauce Labs'))
        console.error(chalk.red(err.stack))
        return process.exit(1)
      }

      var browsers = []
      var byOs = {}

      toTest.forEach(function (info) {
        var key = info.api_name + ' @ ' + info.os;
        (byOs[key] = byOs[key] || []).push(info.short_version)

        airtap.browser({
          browser: info.api_name,
          version: info.short_version,
          platform: info.os
        })
      })

      // pretty prints which browsers we will test on what platforms
      for (var item in byOs) {
        console.log(chalk`{gray - testing: ${item}: ${byOs[item].join(' ')}}`)
      }

      var passedTestsCount = 0
      var failedBrowsersCount = 0
      var lastOutputName

      airtap.on('browser', function (browser) {
        browsers.push(browser)

        var name = browser.toString()
        var waitInterval

        browser.once('init', function () {
          console.log(chalk`{gray - queuing: ${name}}`)
        })

        browser.on('start', function (reporter) {
          console.log(chalk`{white - starting: ${name}}`)

          clearInterval(waitInterval)
          waitInterval = setInterval(function () {
            console.log(chalk`{yellow - waiting:} ${name}`)
          }, 1000 * 30)

          var currentTest
          reporter.on('test', function (test) {
            currentTest = test
          })

          reporter.on('console', function (msg) {
            if (lastOutputName !== name) {
              lastOutputName = name
              console.log(chalk`{white ${name} console}`)
            }

            // When testing with microsoft edge:
            // Adds length property to array-like object if not defined to execute console.log properly
            if (msg.args.length === undefined) {
              msg.args.length = Object.keys(msg.args).length
            }
            console.log.apply(console, msg.args)
          })

          reporter.on('assertion', function (assertion) {
            console.log()
            console.log(chalk`{red ${name} ${currentTest ? currentTest.name : 'undefined test'}}`)
            console.log(chalk`{red Error: ${assertion.message}}`)

            // When testing with microsoft edge:
            // Adds length property to array-like object if not defined to execute forEach properly
            if (assertion.frames.length === undefined) {
              assertion.frames.length = Object.keys(assertion.frames).length
            }
            Array.prototype.forEach.call(assertion.frames, function (frame) {
              console.log()
              console.log(chalk`{gray ${frame.func} ${frame.filename}:${frame.line}}`)
            })
            console.log()
          })

          reporter.once('done', function () {
            clearInterval(waitInterval)
          })
        })

        browser.once('done', function (results) {
          passedTestsCount += results.passed

          if (results.failed > 0 || results.passed === 0) {
            console.log(chalk`{red - failed: ${name}, (${results.failed}, ${results.passed})}`)
            failedBrowsersCount++
            return
          }
          console.log(chalk`{green - passed: ${name}}`)
        })
      })

      airtap.on('restart', function (browser) {
        var name = browser.toString()
        console.log(chalk`{red - restarting: ${name}}`)
      })

      airtap.on('error', function (err) {
        shutdownAllBrowsers(function () {
          throw err
        })
      })

      airtap.run(function (err, passed) {
        if (err) throw err

        if (failedBrowsersCount > 0) {
          console.log(chalk`{red ${failedBrowsersCount} browser(s) failed}`)
        } else if (passedTestsCount === 0) {
          console.log(chalk.yellow('No tests ran'))
        } else {
          console.log(chalk.green('All browsers passed'))
        }

        process.exit((passedTestsCount > 0 && failedBrowsersCount === 0) ? 0 : 1)
      })

      function shutdownAllBrowsers (done) {
        var Batch = require('batch')
        var batch = new Batch()

        browsers.forEach(function (browser) {
          batch.push(function (done) {
            browser.shutdown()
            browser.once('done', done)
          })
        })

        batch.end(done)
      }
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
