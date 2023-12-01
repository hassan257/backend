const { io } = require('../index');
// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');
    client.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
    // Ejemplo de escucha de mensajes particulares
    client.on('message', (payload) => {
        console.log('Message!', payload);
        io.emit('message', {
            message: 'message from server'
        });
    });
});