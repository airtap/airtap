module.exports = function () {
  return [
    { type: 'console', level: 'log', args: [{ hey: 'you' }] },
    { type: 'console', level: 'log', args: [1, 2, [3, 4]] },
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
