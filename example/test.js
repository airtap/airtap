var test = require('tape')
var html = require('./html')

test('should set inner html', function (t) {
  var el = document.createElement('div')
  html(el, '<p>foobar</p>')
  t.is(el.innerHTML, '<p>foobar</p>')
  t.end()
})
