var socketio = require('socket.io')
var http=require('http');


module.exports.listen = function(server){
    io = socketio.listen(server)
    /*io.on('connection',function(){
        console.log("socket io running");
    });*/
    return io
};