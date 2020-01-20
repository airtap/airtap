// Updated version of https://github.com/substack/tap-finished

var Parser = require('tap-parser')

module.exports = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  if (opts.wait === undefined) opts.wait = 1000

  var p = new Parser()
  var seen = { plan: null, asserts: 0 }
  var finished = false
  var ended = false
  var timer

  p.on('end', function () { ended = true })

  p.on('assert', function (a) {
    seen.asserts++
    check()
  })

  p.on('plan', function (plan) {
    seen.plan = plan.end - plan.start
    check()
  })

  p.on('complete', cb)
  p.destroy = destroy

  return p

  function check () {
    if (finished) return
    if (seen.plan === null || seen.asserts < seen.plan) return
    finish()
  }

  function destroy () {
    clearTimeout(timer)
    p.removeAllListeners()
  }

  function finish () {
    finished = true

    // I don't understand this line from the original
    // p.on('complete', cb)

    if (opts.wait && !ended) {
      timer = setTimeout(function () { p.end() }, opts.wait)
    } else {
      p.end()
    }
  }
}
