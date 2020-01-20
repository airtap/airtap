var test = require('tape')
var http = require('http')
var html = require('./html')

test('should set inner html', function (t) {
  var el = document.createElement('div')
  html(el, '<p>foobar</p>')
  t.is(el.innerHTML, '<p>foobar</p>')
  t.end()
})

test('has support server', function (t) {
  t.plan(1)

  var options = {
    hostname: window.location.hostname,
    port: window.location.port
  }

  http.request(options, function (res) {
    t.is(res.statusCode, 200)
  }).end()
})
