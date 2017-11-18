var io;

function init(server) {
    let inIo = require('socket.io')(server);
    io = inIo;
    io.on('connect', () => {
        console.log('server io connected')
    })
}
module.exports = {
    init: init,
    getIo: () => {
        return io
    }
}