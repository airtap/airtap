const load = require('load-script')
const engineClient = require('engine.io-client')

// Without Developer Tools open, console is undefined in IE9.
if (typeof global.console === 'undefined') {
  global.console = {}
}

const container = document.getElementById('airtap')
const colors = { pending: '#e4a533', fail: '#d83131', ok: '#69cf69' }
const socket = engineClient('ws://' + window.location.host, { path: '/airtap/msg' })
let started = false

socket.on('open', function () {
  socket.on('message', function (json) {
    const msg = JSON.parse(json)

    if (msg.type === 'start') {
      started = true
      status(colors.pending)

      load('/airtap/test.js', function (err) {
        if (err) {
          status(colors.fail)
          send({ type: 'error', fatal: true, message: 'Failed to load test.js' })
        }
      })
    } else if (msg.type === 'end') {
      started = false
      status(msg.ok ? colors.ok : colors.fail)
      send({ type: 'end', coverage: window.__coverage__ }, function () {
        if (!msg.live) socket.close()
        if (!msg.live && msg.selfclosing && window.close) window.close()
      })
    } else if (msg.type === 'reload') {
      window.location.reload()
    }
  })

  global.console.log = wrap(global.console.log, 'log')
  global.console.error = wrap(global.console.error, 'error')

  window.onerror = onerror

  function send (msg, ondrain) {
    socket.send(JSON.stringify(msg), ondrain)
  }

  function status (color) {
    document.body.style.backgroundColor = color
  }

  function wrap (original, level) {
    return function log () {
      const args = [].slice.call(arguments)

      // Useful for browsers that don't have a console
      const code = container.appendChild(document.createElement('code'))
      code.textContent = args.join(' ')

      if (started) {
        send({ type: 'console', level: level, args: args })
      }

      // In IE9 this is an object that doesn't have Function.prototype.apply
      if (typeof original === 'function') {
        return original.apply(this, arguments)
      }
    }
  }

  function onerror (message, source, lineno, colno, error) {
    if (!started) return

    send({
      type: 'error',
      message: message,
      source: source,
      lineno: lineno,
      colno: colno,
      error: {
        name: error && error.name,
        stack: error && error.stack
      }
    })
  }
})
