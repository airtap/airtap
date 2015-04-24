var app = require('app');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');

var url = process.argv[2];

require('crash-reporter').start();

app.on('ready', function () {
    var mainWindow = new BrowserWindow({show: false, preload: __dirname + '/electron-inject'});
    mainWindow.loadUrl(url);

    ipc.once('started', function () {
        mainWindow.send('started');
    });

    ipc.on('zuulmessage', function(e, msg) {
        console.log(JSON.stringify(msg));
        if (msg.type === 'done') {
          app.quit();
        }
    });
});
