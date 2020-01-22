'use strict'

const Airtap = require('../..')
const fs = require('fs')
const path = require('path')

module.exports = function (test, provider, options) {
  if (!options) options = {}

  test(function (t) {
    const airtap = new Airtap()

    // Temporary workaround, airtap-multi wants an id
    provider.prototype.id = 'anonymous'

    airtap.provider(provider, options.provider)

    airtap.manifests(options.wanted, function (err, manifests) {
      if (err) return t.fail(err)

      if (!manifests.length) {
        return t.fail('Zero manifests')
      } else if (manifests.length > 100) {
        return t.fail('Too many manifests, unsafe to test')
      }

      testTap(t, airtap, manifests, options.test)
      testTimeout(t, airtap, manifests, options.test)

      t.end()
    })
  })
}

function testTap (t, airtap, manifests, options) {
  const cwd = path.resolve(__dirname, 'fixtures', 'tap')
  const read = (fp) => fs.readFileSync(path.join(cwd, fp), 'utf8')
  const expectedStats = JSON.parse(read('stats.json'))
  const expectedOut = read('out').trim()

  t.test('tap', function (t) {
    airtap.test(manifests, ['test.js'], { ...options, cwd, annotate: false })
      .on('error', t.fail.bind(t))
      .on('context', function (context) {
        const title = context.browser.title

        context.on('session', function (session) {
          t.pass(`${title} started`)

          let out = ''
          session.on('data', function (chunk) {
            out += chunk
          })

          session.on('complete', function (stats) {
            t.is(strip(out), expectedOut, `${title} tap`)

            for (const k in expectedStats) {
              t.is(stats[k], expectedStats[k], `${title} stats.${k}`)
            }
          })
        })
      })
      .on('complete', function (stats) {
        t.is(stats.ok, expectedStats.ok)
        t.is(stats.count, manifests.length, manifests.length + ' completed')
        t.is(stats.pass, expectedStats.ok ? manifests.length : 0, 'n passed')
        t.is(stats.fail, expectedStats.ok ? 0 : manifests.length, 'n failed')

        t.end()
      })
  })
}

function testTimeout (t, airtap, manifests, options) {
  const cwd = path.resolve(__dirname, 'fixtures', 'timeout')

  // The timeout here must be less than the tape timeout in test.js
  options = { ...options, cwd, timeout: 1e3, concurrency: 2, retries: 0 }

  t.test('timeout', function (t) {
    airtap.test(manifests, ['test.js'], options)
      .on('error', function (err) {
        // Will either timeout on session start or session output
        t.ok(err, String(err))
        t.end()
      })
      .on('context', function (context) {
        context.on('session', function (session) {
          // This may or may not happen
          t.pass(`${context.browser.title} started`)

          session.on('complete', function () {
            t.fail('session should not complete')
          }).resume()
        })
      })
      .on('complete', function () {
        t.fail('test should not complete')
      })
  })
}

function strip (tap) {
  const lines = tap.trim().split(/\r?\n/)
  const isDiagnostic = (line) => line === '' || line[0] === '#'

  // Don't care about diagnostics after completion
  while (lines.length && isDiagnostic(lines[lines.length - 1])) {
    lines.pop()
  }

  // Don't care about YAML blocks (that may contain stack traces)
  for (let i = 0, inblock = false; i < lines.length; i++) {
    if (inblock) {
      if (lines[i].startsWith('  ...')) inblock = false
      lines.splice(i--, 1)
    } else if (lines[i].startsWith('  ---')) {
      inblock = true
      lines.splice(i--, 1)
    }
  }

  return lines.join('\n').trim()
}
