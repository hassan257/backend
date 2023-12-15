const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
require('dotenv').config();

// DB Config
require('./database/config').dbConnection();

// App de express
const app = express();

// Lectura y parseo del Body
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Node server
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server);

require('./sockets/sockets');

// Path público
const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// Mis rutas
app.use('/api/login', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/accounts', require('./routes/accounts'));

server.listen(process.env.PORT, (err) => {
    if (err) throw new Error(err);
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});