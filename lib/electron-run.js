var path = require('path')
var electron = require('electron')

electron.app.on('ready', function () {
  var preload = path.join(__dirname, 'electron-inject.js')
  var options = {
    show: false,
    webPreferences: {
      preload: preload
    },
    preload: preload
  }

  electron.ipcMain.on('zuulmessage', function (e, msg) {
    console.log(JSON.stringify(msg))
    if (msg.type === 'done') {
      electron.app.quit()
    }
  })

  var window = new electron.BrowserWindow(options)
  window.loadURL(process.argv[2])
})
