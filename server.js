var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 9020;

app.use(express.static('site'));

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
 
app.use(function (req, res) {
  res.send({ msg: "hello" });
});
 
 
server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
