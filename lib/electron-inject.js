;(function () {
  var ipc = require('electron').ipcRenderer

  window.zuul_msg_bus = []

  function loop () {
    var msgs = window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length)
    msgs.forEach(function (msg) {
      ipc.send('zuulmessage', msg)
    })
    setTimeout(loop, 100)
  }

  loop()
}())
