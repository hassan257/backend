const { response } = require('express');
const { validarGoogleIdToken } = require('../helpers/google-verify-token');

const googleAuth = async (req, res = response) => {
    const token = req.body.token;
    const googleUser = await validarGoogleIdToken(token);
    if (!googleUser) {
        return res.status(400).json({
            ok: false
        });
    }
    // TODO: Guardar en la base de datos
    res.json({
        success: true,
        message: 'Usuario Logueado',
        data: googleUser
    });
}

module.exports = {
    googleAuth
}