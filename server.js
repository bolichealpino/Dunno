var WebSocketServer = require('ws').Server;
var wss             = new WebSocketServer({port: 9020});
var msgs            = "";
var clients         = [];
var disconnected    = {};
wss.on('connection', function connection(ws) {
    function new_msg(msg){
        msgs = msgs+(msgs.length === 0?"":",")+msg;
        for (var i=0, l=clients.length; i<l; ++i)
            if (!disconnected[i])
                clients[i].send(msg);
        console.log(msg);
    };
    var client_id = clients.length;
    clients.push(ws);
    ws.send(msgs);
    new_msg('{"type":"join"}');
    ws.on('message', new_msg);
    ws.on('close', function(){ disconnected[client_id] = true; });
});
