var electron;

try {
  electron = require('electron');
} catch (e) {
  electron = {
      app: require('app'),
      ipcMain: require('ipc'),
      BrowserWindow: require('browser-window')
  };
}

var url = process.argv[2];

electron.app.on('ready', function () {
    var options = {
      show: false,
      webPreferences: {
        preload: __dirname + '/electron-inject.js'
      }
    };
    options.preload = options.webPreferences.preload;
    var mainWindow = new electron.BrowserWindow(options);

    (mainWindow.loadURL || mainWindow.loadUrl).call(mainWindow, url);

    electron.ipcMain.once('started', function () {
        mainWindow.send('started');
    });

    electron.ipcMain.on('zuulmessage', function(e, msg) {
        console.log(JSON.stringify(msg));
        if (msg.type === 'done') {
          electron.app.quit();
        }
    });
});
