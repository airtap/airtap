var wd = require('wd')
var originalRemote = wd.remote
var hook

function MockWebdriver (hostname, port, username, key) {
  if (!(this instanceof MockWebdriver)) {
    return new MockWebdriver(hostname, port, username, key)
  }

  hook(this)
}

module.exports = MockWebdriver

MockWebdriver.attach = function (fn) {
  wd.remote = MockWebdriver
  hook = fn
}

MockWebdriver.detach = function () {
  wd.remote = originalRemote
  hook = null
}

MockWebdriver.prototype.init = function (initOpts, callback) {
  process.nextTick(callback)
}

MockWebdriver.prototype.sauceJobStatus = function (passed, callback) {
  process.nextTick(callback)
}

MockWebdriver.prototype.get = function (url, callback) {
  process.nextTick(callback)
}

MockWebdriver.prototype.eval = function (js, callback) {
  process.nextTick(callback, [])
}

MockWebdriver.prototype.quit = function (callback) {
  process.nextTick(callback)
}
