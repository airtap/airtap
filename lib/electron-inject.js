!function() {
    var ipc;
    try {
      ipc = require('electron').ipcRenderer;
    } catch (e) {
      ipc = require('ipc');
    }
    window.zuul_msg_bus = [];
    ipc.on('started', loop);
    window.setTimeout(ipc.send.bind(ipc, 'started'));
    function loop() {
        var msgs = window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length);
        msgs.forEach(send);
        setTimeout(loop, 100);
    }
    function send(msg) {
        ipc.send('zuulmessage', msg);
    }
}();
