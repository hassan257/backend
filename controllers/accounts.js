const { response } = require("express");
const mongoose = require('mongoose');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require("../models/usuario");

/**
 * Crea una nueva cuenta dentro de un libro para un usuario específico.
 * @param {Object} req - Objeto de solicitud express.
 * @param {Object} res - Objeto de respuesta express.
 * @returns {Object} - Respuesta JSON que indica el resultado de la operación.
 * @throws {Object} - Respuesta JSON en caso de un error durante la transacción.
 */
const create = async (req, res = response) => {
    // Inicia una sesión de base de datos con transacción
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Obtiene el ID del usuario desde la solicitud
            const uid = req.uid;

            // Extrae los datos de la solicitud para la creación de la cuenta
            const { bookId, nombre, saldo } = req.body;

            // Busca el usuario por su ID
            const usuario = await Usuario.findById(uid);

            // Verifica si el usuario existe
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            // Busca el libro dentro de los libros del usuario por su ID
            const libro = usuario.libros.id(bookId);

            // Verifica si el libro existe
            if (!libro) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Agrega una nueva cuenta al array de cuentas del libro
            libro.accounts.push({ nombre, saldo });

            // Guarda el usuario actualizado en la base de datos
            await usuario.save();

            // Filtra las cuentas que no han sido eliminadas suavemente
            const accounts = libro.accounts.filter(account => !account.deleted_at).map(account => ({
                ...account.toObject(),
                bookId: libro._id,
                uid: account._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de la cuenta y el nuevo token
            res.json({
                success: true,
                message: 'Account created',
                data: accounts,
                token
            });
        });
    } catch (error) {
        // En caso de un error durante la transacción, logea el error y envía una respuesta JSON de error
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Create failed'
        });
    } finally {
        // Finaliza la sesión de base de datos, independientemente de si la transacción fue exitosa o no
        session.endSession();
    }
}




/**
 * Obtiene las cuentas de un libro específico para un usuario.
 * @param {Object} req - Objeto de solicitud express.
 * @param {Object} res - Objeto de respuesta express.
 * @returns {Object} - Respuesta JSON que contiene las cuentas del libro y un nuevo token JWT.
 * @throws {Object} - Respuesta JSON en caso de un error durante la transacción.
 */
const read = async (req, res = response) => {
    // Inicia una sesión de base de datos con transacción
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Obtiene el ID del usuario desde la solicitud
            const uid = req.uid;

            // Extrae el ID del libro desde la solicitud
            const { bookId } = req.body;

            // Busca el usuario por su ID
            const usuario = await Usuario.findById(uid);

            // Verifica si el usuario existe
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            // Busca el libro dentro de los libros del usuario por su ID
            const libro = usuario.libros.id(bookId);

            // Verifica si el libro existe
            if (!libro) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Filtra las cuentas que no han sido eliminadas suavemente
            var accounts = libro.accounts.filter(account => !account.deleted_at).map(account => ({
                ...account.toObject(),
                bookId: libro._id,
                uid: account._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas y el nuevo token
            res.json({
                success: true,
                message: 'Accounts retrieved successfully',
                data: accounts,
                token
            });
        });
    } catch (error) {
        // En caso de un error durante la transacción, logea el error y envía una respuesta JSON de error
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Read failed'
        });
    } finally {
        // Finaliza la sesión de base de datos, independientemente de si la transacción fue exitosa o no
        session.endSession();
    }
}



/**
 * Actualiza los datos de una cuenta específica dentro de un libro para un usuario.
 * @param {Object} req - Objeto de solicitud express.
 * @param {Object} res - Objeto de respuesta express.
 * @returns {Object} - Respuesta JSON que contiene las cuentas actualizadas del libro y un nuevo token JWT.
 * @throws {Object} - Respuesta JSON en caso de un error durante la transacción.
 */
const update = async (req, res = response) => {
    // Inicia una sesión de base de datos con transacción
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Obtiene el ID del usuario desde la solicitud
            const uid = req.uid;

            // Extrae los datos de la solicitud para la actualización de la cuenta
            const { bookId, accountId, nombre, saldo } = req.body;

            // Busca el usuario por su ID
            const usuario = await Usuario.findById(uid);

            // Verifica si el usuario existe
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            // Busca el libro dentro de los libros del usuario por su ID
            const libro = usuario.libros.id(bookId);

            // Verifica si el libro existe
            if (!libro) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Buscar la cuenta dentro del libro por su _id
            const cuenta = libro.accounts.id(accountId);

            // Verifica si la cuenta existe
            if (!cuenta) {
                return res.json({
                    success: false,
                    message: 'Account not found'
                });
            }

            // Actualizar los datos de la cuenta
            cuenta.nombre = nombre;
            cuenta.saldo = saldo;

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar las cuentas que no han sido eliminadas suavemente
            const accounts = libro.accounts.filter(account => !account.deleted_at).map(account => ({
                ...account.toObject(),
                bookId: libro._id,
                uid: account._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Account updated successfully',
                data: accounts,
                token
            });
        });
    } catch (error) {
        // En caso de un error durante la transacción, logea el error y envía una respuesta JSON de error
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Update failed'
        });
    } finally {
        // Finaliza la sesión de base de datos, independientemente de si la transacción fue exitosa o no
        session.endSession();
    }
}


/**
 * Marca una cuenta específica como eliminada suavemente dentro de un libro para un usuario.
 * @param {Object} req - Objeto de solicitud express.
 * @param {Object} res - Objeto de respuesta express.
 * @returns {Object} - Respuesta JSON que contiene las cuentas actualizadas del libro y un nuevo token JWT.
 * @throws {Object} - Respuesta JSON en caso de un error durante la transacción.
 */
const destroy = async (req, res = response) => {
    // Inicia una sesión de base de datos con transacción
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            // Obtiene el ID del usuario desde la solicitud
            const uid = req.uid;

            // Extrae los datos de la solicitud para la eliminación de la cuenta
            const { bookId, accountId } = req.body;

            // Busca el usuario por su ID
            const usuario = await Usuario.findById(uid);

            // Verifica si el usuario existe
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            // Busca el libro dentro de los libros del usuario por su ID
            const libro = usuario.libros.id(bookId);

            // Verifica si el libro existe
            if (!libro) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Buscar la cuenta dentro del libro por su _id
            const cuenta = libro.accounts.id(accountId);

            // Verifica si la cuenta existe
            if (!cuenta) {
                return res.json({
                    success: false,
                    message: 'Account not found'
                });
            }

            // Marcar la cuenta como eliminada suavemente
            cuenta.softDelete();

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar las cuentas que no han sido eliminadas suavemente
            const accounts = libro.accounts.filter(account => !account.deleted_at).map(account => ({
                ...account.toObject(),
                bookId: libro._id,
                uid: account._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Account deleted successfully',
                data: accounts,
                token
            });
        });
    } catch (error) {
        // En caso de un error durante la transacción, logea el error y envía una respuesta JSON de error
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Delete failed'
        });
    } finally {
        // Finaliza la sesión de base de datos, independientemente de si la transacción fue exitosa o no
        session.endSession();
    }
}


module.exports = {
    create,
    read,
    update,
    destroy
}