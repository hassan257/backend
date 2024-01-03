const { response } = require('express');
const mongoose = require('mongoose');
const { validarGoogleIdToken } = require('../helpers/google-verify-token.js');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require('../models/usuario');

const googleAuth = async (req, res = response) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { token } = req.body;
            const googleUser = await validarGoogleIdToken(token);

            if (!googleUser) {
                return res.json({
                    success: false,
                    message: "The user hasn't a valid google account"
                });
            }

            const { email, name } = googleUser;

            // Use `session` in the operations that need to be part of the transaction
            await Usuario.findOneAndUpdate(
                { email },
                { $setOnInsert: { email } },  // Perform the update if the document doesn't exist
                { upsert: true, session }
            );

            // Retrieve the user within the transaction
            let usuario = await Usuario.findOne({ email }).session(session);

            // Validate existence of libros and add default if necessary
            usuario = await validarExistenciaLibros(usuario);

            const uid = usuario._id;
            const libros = usuario.libros.filter(libro => !libro.deleted_at);

            // Generate JWT
            const jwtToken = await generarJWT(uid);

            // Prepare the final response
            const data = {
                email,
                name,
                // picture,
                uid,
                libros
            };

            res.json({
                success: true,
                message: 'Login successful',
                data,
                token: jwtToken
            });
        });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Login unsuccessful'
        });
    } finally {
        session.endSession();
    }
};

const renewToken = async (req, res = response) => {
    const uid = req.uid;
    const token = await generarJWT(uid);
    const usuario = await Usuario.findById(uid);
    if (usuario == null) return res.json({
        success: false,
        message: 'User not found'
    });
    const libros = usuario.libros.filter(libro => !libro.deleted_at);
    res.json({
        success: true,
        message: 'Token renewed',
        data: {
            email: usuario.email,
            // uid: req.uid,
            libros: libros
        },
        token: token
    });
}

const validarExistenciaLibros = async (usuario = Usuario) => {
    try {
        if (usuario.libros.length === 0) {
            const defaultLibro = { nombre: 'My first book' };
            usuario.libros.push(defaultLibro);
            await usuario.save();
        }
        return usuario;
    } catch (error) {
        console.error('Error al validar existencia de libros:', error);
        throw new Error('Error al validar existencia de libros');
    }
}


module.exports = {
    googleAuth,
    renewToken
}