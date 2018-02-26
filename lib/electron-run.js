var path = require('path')

var electron

try {
  electron = require('electron')
} catch (e) {
  electron = {
    app: require('app'),
    ipcMain: require('ipc'),
    BrowserWindow: require('browser-window')
  }
}

var url = process.argv[2]

electron.app.on('ready', function () {
  var preload = path.join(__dirname, 'electron-inject.js')
  var options = {
    show: false,
    webPreferences: {
      preload: preload
    },
    preload: preload
  }
  var mainWindow = new electron.BrowserWindow(options)

  electron.ipcMain.on('zuulmessage', function (e, msg) {
    console.log(JSON.stringify(msg))
    if (msg.type === 'done') {
      electron.app.quit()
    }
  });

  (mainWindow.loadURL || mainWindow.loadUrl).call(mainWindow, url)
})
