'use strict'

const test = require('tape')
const BrowserSession = require('../../lib/browser-session')

function messages () {
  return [
    { type: 'console', level: 'log', args: ['TAP version 13'] },
    { type: 'console', level: 'log', args: ['# ok'] },
    { type: 'console', level: 'log', args: ['ok 1 (unnamed assert)'] },
    { type: 'console', level: 'log', args: ['# fail'] },
    { type: 'console', level: 'log', args: ['not ok 2 should be truthy'] },
    { type: 'console', level: 'log', args: ['# suite'] },
    { type: 'console', level: 'log', args: ['ok 3 yeah'] },
    { type: 'console', level: 'log', args: ['not ok 4 WOOPS'] },
    { type: 'console', level: 'log', args: ['not ok 5'] },
    { type: 'console', level: 'log', args: ['# pass'] },
    { type: 'console', level: 'log', args: ['ok 6 (unnamed assert)'] },
    { type: 'console', level: 'log', args: ['# plan'] },
    { type: 'console', level: 'log', args: ['ok 7 true is true AWESOME'] },
    { type: 'console', level: 'log', args: ['# failed plan'] },
    { type: 'console', level: 'log', args: ['ok 8 one assert'] },
    { type: 'console', level: 'log', args: ['not ok 9 test timed out after 200ms'] },
    { type: 'console', level: 'log', args: [''] },
    { type: 'console', level: 'log', args: ['1..9'] },
    { type: 'console', level: 'log', args: ['# tests 9'] },
    { type: 'console', level: 'log', args: ['# pass  5'] },
    { type: 'console', level: 'log', args: ['# fail  4'] },
    { type: 'console', level: 'log', args: [''] }
  ]
}

test('session', function (t) {
  BrowserSession.reset()
  t.plan(4)

  let output = ''

  const session = new BrowserSession('abc', 30e3, '.')

  session.on('data', function (s) {
    output += s
  })

  session.on('complete', function (stats) {
    t.is(stats.pass, 5)
    t.is(stats.fail, 4)
    t.is(stats.ok, false)

    session.write({ type: 'end' })
  })

  for (const m of messages()) {
    session.write(m)
  }

  session.on('close', function () {
    t.same(output.trim().split('\n'), [
      'TAP version 13',
      '# abc [1]',
      '# ok [1]',
      'ok 1 (unnamed assert) [1]',
      '# fail [1]',
      'not ok 2 should be truthy [1]',
      '# suite [1]',
      'ok 3 yeah [1]',
      'not ok 4 WOOPS [1]',
      'not ok 5 [1]',
      '# pass [1]',
      'ok 6 (unnamed assert) [1]',
      '# plan [1]',
      'ok 7 true is true AWESOME [1]',
      '# failed plan [1]',
      'ok 8 one assert [1]',
      'not ok 9 test timed out after 200ms [1]',
      '',
      '1..9',
      '# tests 9 [1]',
      '# pass  5 [1]',
      '# fail  4 [1]'
    ])
  })
})

test('session start timeout', function (t) {
  t.plan(2)

  let output = ''

  const session = new BrowserSession('abc', 200, '.')

  session.on('data', function (s) {
    output += s
  })

  session.on('complete', function (stats) {
    t.fail('should not complete')
  })

  session.on('error', function (err) {
    t.is(err.message, 'Did not receive output from \'abc\' (0.2 seconds)')

    session.on('close', function () {
      t.same(output, '')
    })
  })
})

test('session output timeout', function (t) {
  t.plan(2)

  let output = ''

  const session = new BrowserSession('abc', 200, '.')

  session.on('data', function (s) {
    output += s
  })

  session.on('complete', function (stats) {
    t.fail('should not complete')
  })

  session.on('error', function (err) {
    t.is(err.message, 'Did not receive output from \'abc\' (0.2 seconds)')

    session.on('close', function () {
      t.same(output, 'TAP version 13\n# abc [3]\n')
    })
  })

  session.write({
    type: 'console',
    level: 'log',
    args: ['TAP version 13']
  })
})

test('session unknown message', function (t) {
  t.plan(2)

  const session = new BrowserSession('abc', 30e3, '.')

  session.on('error', function (err) {
    t.is(err.message, 'Unknown message type')
  })

  session.on('close', function () {
    t.pass('closed')
  })

  session.resume()
  session.write({ type: 'foo' })
})
