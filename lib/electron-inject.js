!function() {
    var ipc = require('ipc');
    window.zuul_msg_bus = [];
    ipc.on('started', loop);
    ipc.send('started');
    function loop() {
        var msgs = window.zuul_msg_bus.splice(0, window.zuul_msg_bus.length);
        msgs.forEach(send);
        setTimeout(loop, 100);
    }
    function send(msg) {
        ipc.send('zuulmessage', msg);
    }
}();
