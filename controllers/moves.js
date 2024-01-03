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
            const { bookId, cantidad, categoriaId, cuentaId, conceptoId, fecha, nombre, tipoMovimientoId } = req.body;
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

            // Busca la cuenta dentro de las cuentas del libro por su ID
            const cuenta = libro.accounts.id(cuentaId);

            // Verifica si la cuenta existe
            if(!cuenta){
                return res.json({
                    success: false,
                    message: 'Account not found'
                });
            }

            // Agrega un nuevo movimiento al array de movimientos de la cuenta
            cuenta.moves.push({ cantidad, categoriaId, conceptoId, fecha, nombre, tipoMovimientoId });

            // Guarda el usuario actualizado en la base de datos
            await usuario.save();

            // Filtra los movimientos que no han sido eliminados suavemente
            const moves = cuenta.moves.filter(move => !move.deleted_at).filter(move => {
                const moveDate = new Date(move.fecha);
                const currentDate = new Date();
                return moveDate.getMonth() === currentDate.getMonth() && moveDate.getFullYear() === currentDate.getFullYear();
            }).map(move => ({
                ...move.toObject(),
                bookId: libro._id,
                cuentaId: cuenta._id,
                uid: move._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de la cuenta y el nuevo token
            res.json({
                success: true,
                message: 'Move created',
                data: moves,
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
            const { bookId, cuentaId } = req.body;

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

            // Inicializa la variable para almacenar los movimientos
            let moves;

            // Revisa si lleva la cuenta, si no la lleva, devuelve todos los movimientos
            if (cuentaId == null || cuentaId === '') {
                // Filtra los movimientos que no han sido eliminados suavemente para todos los libros
                moves = libro.accounts.reduce((acc, cuenta) => {
                    const filteredMoves = cuenta.moves.filter(move => !move.deleted_at).filter(move => {
                        const moveDate = new Date(move.fecha);
                        const currentDate = new Date();
                        return moveDate.getMonth() === currentDate.getMonth() && moveDate.getFullYear() === currentDate.getFullYear();
                    }).map(move => ({
                        ...move.toObject(),
                        bookId: libro._id,
                        cuentaId: cuenta._id,
                        uid: move._id // Agrega el bookId a cada cuenta
                    }));
                    return [...acc, ...filteredMoves];
                }, []);
            } else {
                // Busca la cuenta dentro de las cuentas del usuario por su ID
                const cuenta = libro.accounts.id(cuentaId);

                // Verifica si el cuenta existe
                if (!cuenta) {
                    return res.json({
                        success: false,
                        message: 'Account not found'
                    });
                }
                // Filtra los movimientos que no han sido eliminadas suavemente
                moves = cuenta.moves.filter(move => !move.deleted_at).filter(move => {
                    const moveDate = new Date(move.fecha);
                    const currentDate = new Date();
                    return moveDate.getMonth() === currentDate.getMonth() && moveDate.getFullYear() === currentDate.getFullYear();
                }).map(move => ({
                    ...move.toObject(),
                    bookId: libro._id,
                    cuentaId: cuenta._id,
                    uid: move._id // Agrega el bookId a cada cuenta
                }));
            }

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas y el nuevo token
            res.json({
                success: true,
                message: 'Moves retrieved successfully',
                data: moves,
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
            const { bookId, accountId, moveId, cantidad, categoriaId, conceptoId, fecha, nombre, tipoMovimientoId } = req.body;

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

            // Busca la cuenta dentro de las cuentas del usuario por su ID
            const cuenta = libro.accounts.id(accountId);

            // Verifica si el cuenta existe
            if (!cuenta) {
                return res.json({
                    success: false,
                    message: 'Account not found'
                });
            }

            // Buscar el movimiento dentro de la cuenta por su _id
            const movimiento = cuenta.moves.id(moveId);

            // Verifica si la movimiento existe
            if (!movimiento) {
                return res.json({
                    success: false,
                    message: 'Move not found'
                });
            }

            // Actualizar los datos del movimiento
            movimiento.cantidad = cantidad;
            movimiento.categoriaId = categoriaId;
            movimiento.conceptoId = conceptoId;
            movimiento.fecha = fecha;
            movimiento.nombre = nombre;
            movimiento.tipoMovimientoId = tipoMovimientoId;

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar los movimientos que no han sido eliminados suavemente
            const moves = cuenta.moves.filter(move => !move.deleted_at).filter(move => {
                const moveDate = new Date(move.fecha);
                const currentDate = new Date();
                return moveDate.getMonth() === currentDate.getMonth() && moveDate.getFullYear() === currentDate.getFullYear();
            }).map(move => ({
                ...move.toObject(),
                bookId: libro._id,
                cuentaId: cuenta._id,
                uid: move._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Move updated successfully',
                data: moves,
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
            const { bookId, accountId, moveId } = req.body;

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

            const movimiento = cuenta.moves.id(moveId);

            if(!movimiento){
                return res.json({
                    success: false,
                    message: 'Move not found'
                });
            }

            // Marcar la cuenta como eliminada suavemente
            movimiento.softDelete();

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar las cuentas que no han sido eliminadas suavemente
            const moves = cuenta.moves.filter(move => !move.deleted_at).filter(move => {
                const moveDate = new Date(move.fecha);
                const currentDate = new Date();
                return moveDate.getMonth() === currentDate.getMonth() && moveDate.getFullYear() === currentDate.getFullYear();
            }).map(move => ({
                ...move.toObject(),
                bookId: libro._id,
                cuentaId: cuenta._id,
                uid: move._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Move deleted successfully',
                data: moves,
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