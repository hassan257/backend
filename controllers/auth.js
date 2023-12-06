const { response } = require('express');
const { validarGoogleIdToken } = require('../helpers/google-verify-token');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require('../models/usuario');

const googleAuth = async (req, res = response) => {
    try {
        const { token } = req.body;
        const googleUser = await validarGoogleIdToken(token);
        if (!googleUser) {
            return res.status(400).json({
                success: false,
                message: "The user haven't a valid google account"
            });
        }
        const { email, name, picture } = googleUser;
        // Revisar si el usuario existe
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            // Guardar u obtener datos del usuario
            usuario = new Usuario({ email: email });
            await usuario.save();
        }
        const { uid } = usuario;
        // Generar JWT
        const jwtToken = await generarJWT(uid);
        // Preparar respuesta final
        let data = {
            email,
            name,
            picture,
            uid
        };
        res.json({
            success: true,
            message: 'Login successful',
            data: data,
            token: jwtToken
        });
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "Login unsuccessful"
        });
    }

}

const renewToken = async (req, res = response) => {
    const uid = req.uid;
    const token = await generarJWT(uid);
    const usuario = await Usuario.findById(uid);
    res.json({
        success: true,
        message: 'Token renewed',
        data: {
            email: usuario.email,
            uid: req.uid
        },
        token: token
    });
}

module.exports = {
    googleAuth,
    renewToken
}