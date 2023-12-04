const { response } = require('express');

const crearUsuario = (req, res = response) => {

    res.json({
        success: true,
        message: 'Usuario Logueado'
    });
}

module.exports = {
    crearUsuario
}