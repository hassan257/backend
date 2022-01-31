'use strict'
var mongoose = require('mongoose');
const app = require('./app');
var port = 3700;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/portafolio')
    .then(() => {
        console.log("Conexión a la BD establecida con exito.");
        // Creación de Servidor
        app.listen(port, () => {
            console.log('Servidor corriendo correctamente en la URL http://localhost:3700')
        });
    })
    .catch((error) => {
        console.log(error);
    });

// Comandos para iniciar servidor de BD de mongo
// cd "C:\data\db"
// mongod

// Comandos para iniciar servidor de node
// node index.js

// Comando para inicar angular
// ng serve
