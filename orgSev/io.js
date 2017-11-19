var io;

function init(server) {
    let inIo = require('socket.io')(server);
    io = inIo;
    io.on('connect', () => {
        console.log('server io connected')
    })
    // socket.on('exchangeResult', function(msg){
    //     io.emit('exchangeResult',{ for: 'everyone' });
    // });
}
module.exports = {
    init: init,
    getIo: () => {
        return io
    }
}