var electron = require('electron')
var opts = JSON.parse(process.argv[2])

electron.app.on('ready', function () {
  var window = new electron.BrowserWindow({
    show: !!opts.show
  })

  if (opts.show) {
    window.webContents.openDevTools()
  }

  window.loadURL(opts.url)
})
