var test = require('tape')
var allBrowsers = require('../fixtures/all-browsers.json')
var flattenBrowser = require('../../lib/flatten-browserlist')

test('flatten browser:simple', function (t) {
  var request = [
    {name: 'iphone', version: '7.0..latest'},
    {name: 'android', version: '4.1'},
    {name: 'ipad', version: '7.0..latest'}
  ]

  var expected = [
    {name: 'iphone', version: '7.0', platform: 'Mac 10.9'},
    {name: 'iphone', version: '7.1', platform: 'Mac 10.9'},
    {name: 'iphone', version: '8.0', platform: 'Mac 10.10'},
    {name: 'iphone', version: '8.1', platform: 'Mac 10.10'},
    {name: 'iphone', version: '8.2', platform: 'Mac 10.10'},
    {name: 'android', version: '4.1', platform: 'Linux'},
    {name: 'ipad', version: '7.0', platform: 'Mac 10.9'},
    {name: 'ipad', version: '7.1', platform: 'Mac 10.9'},
    {name: 'ipad', version: '8.0', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.1', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.2', platform: 'Mac 10.10'}
  ]

  t.same(
    flattenBrowser(request, allBrowsers),
    expected,
    'We found the browsers to test'
  )
  t.end()
})

test('flatten browser:stable', function (t) {
  var request = [
    {name: 'chrome', version: '40..latest', platform: 'Windows 2012 R2'}
  ]

  var expected = [
    {name: 'chrome', version: '40', platform: 'Windows 2012 R2'},
    {name: 'chrome', version: '41', platform: 'Windows 2012 R2'},
    {name: 'chrome', version: '42', platform: 'Windows 2012 R2'}
  ]

  t.same(
    flattenBrowser(request, allBrowsers),
    expected,
    'We found the browsers to test'
  )
  t.end()
})

test('flatten browser:negative', function (t) {
  var request = [
    {name: 'chrome', version: '-3..latest', platform: 'Windows 2012 R2'},
    {name: 'safari', version: '-1..latest'},
    {name: 'ipad', version: '-2..8.1', platform: 'Mac 10.10'}
  ]

  var expected = [
    {name: 'chrome', version: '39', platform: 'Windows 2012 R2'},
    {name: 'chrome', version: '40', platform: 'Windows 2012 R2'},
    {name: 'chrome', version: '41', platform: 'Windows 2012 R2'},
    {name: 'chrome', version: '42', platform: 'Windows 2012 R2'},
    {name: 'safari', version: '7', platform: 'Mac 10.9'},
    {name: 'safari', version: '8', platform: 'Mac 10.10'},
    {name: 'ipad', version: '7.1', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.0', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.1', platform: 'Mac 10.10'}
  ]

  t.same(
    flattenBrowser(request, allBrowsers),
    expected,
    'We found the browsers to test'
  )
  t.end()
})

test('flatten browser:negative with arrays', function (t) {
  var request = [
    {name: 'ipad', version: ['7.1', '-2..8.2', '-2..latest']},
    {name: 'ipad', version: '-2..latest'}
  ]

  var expected = [
    {name: 'ipad', version: '7.1', platform: 'Mac 10.9'},
    {name: 'ipad', version: '8.0', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.1', platform: 'Mac 10.10'},
    {name: 'ipad', version: '8.2', platform: 'Mac 10.10'}
  ]

  t.same(
    flattenBrowser(request, allBrowsers),
    expected,
    'We found the browsers to test'
  )
  t.end()
})

test('flatten browser:oldest', function (t) {
  var request = [
    {name: 'chrome', version: 'oldest', platform: 'Windows 2012 R2'},
    {name: 'firefox', version: 'oldest..4', platform: 'Windows 2012 R2'}
  ]

  var expected = [
    {name: 'chrome', version: '26', platform: 'Windows 2012 R2'},
    {name: 'firefox', version: '3.0', platform: 'Windows 2012 R2'},
    {name: 'firefox', version: '3.5', platform: 'Windows 2012 R2'},
    {name: 'firefox', version: '3.6', platform: 'Windows 2012 R2'},
    {name: 'firefox', version: '4', platform: 'Windows 2012 R2'}
  ]

  t.same(
    flattenBrowser(request, allBrowsers),
    expected,
    'We found the browsers to test'
  )
  t.end()
})
