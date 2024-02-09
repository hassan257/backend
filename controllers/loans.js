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
            const { bookId, nombre, cantidad, cuentaId, fechaInicio, fechaFin, tipoMovimientoId } = req.body;
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

            // Agrega un nuevo movimiento al array de movimientos de la cuenta
            libro.loans.push({ nombre, cantidad, cuentaId, fechaInicio, fechaFin, tipoMovimientoId });

            // Guarda el usuario actualizado en la base de datos
            await usuario.save();

            // Filtra los movimientos que no han sido eliminados suavemente
            const loans = libro.loans.filter(loan => !loan.deleted_at).filter(loan => {
                const loanEndDate = new Date(loan.fechaFin);
                const currentDate = new Date();
                return loanEndDate.getMonth() >= currentDate.getMonth() && loanEndDate.getFullYear() >= currentDate.getFullYear();
            }).map(loan => ({
                ...loan.toObject(),
                bookId: libro._id,
                uid: loan._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de la cuenta y el nuevo token
            res.json({
                success: true,
                message: 'Loan created',
                data: loans,
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

            // Inicializa la variable para almacenar los movimientos
            let loans = libro.loans.filter(loan => !loan.deleted_at).filter(loan => {
                const loanEndDate = new Date(loan.fechaFin);
                const currentDate = new Date();
                return loanEndDate.getMonth() >= currentDate.getMonth() && loanEndDate.getFullYear() >= currentDate.getFullYear();
            }).map(loan => ({
                ...loan.toObject(),
                bookId: libro._id,
                uid: loan._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas y el nuevo token
            res.json({
                success: true,
                message: 'Loans retrieved successfully',
                data: loans,
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
            const { bookId, loanId, nombre, cantidad, cuentaId, fechaInicio, fechaFin, tipoMovimientoId } = req.body;

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

            // Buscar el movimiento dentro de la cuenta por su _id
            const loan = libro.loans.id(loanId);

            // Verifica si la movimiento existe
            if (!loan) {
                return res.json({
                    success: false,
                    message: 'Loan not found'
                });
            }

            // Actualizar los datos del movimiento
            loan.nombre = nombre;
            loan.cantidad = cantidad;
            loan.cuentaId = cuentaId;
            loan.fechaInicio = fechaInicio;
            loan.fechaFin = fechaFin;
            loan.tipoMovimientoId = tipoMovimientoId;

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar los movimientos que no han sido eliminados suavemente
            const loans = libro.loans.filter(loan => !loan.deleted_at).filter(loan => {
                const loanEndDate = new Date(loan.fechaFin);
                const currentDate = new Date();
                return loanEndDate.getMonth() >= currentDate.getMonth() && loanEndDate.getFullYear() >= currentDate.getFullYear();
            }).map(loan => ({
                ...loan.toObject(),
                bookId: libro._id,
                uid: loan._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Loan updated successfully',
                data: loans,
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
            const { bookId, loanId } = req.body;

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
            const loan = libro.loans.id(loanId);

            // Verifica si la loan existe
            if (!loan) {
                return res.json({
                    success: false,
                    message: 'Loan not found'
                });
            }

            // Marcar la cuenta como eliminada suavemente
            loan.softDelete();

            // Guardar el usuario actualizado en la base de datos
            await usuario.save();

            // Filtrar las cuentas que no han sido eliminadas suavemente
            const loans = libro.loans.filter(loan => !loan.deleted_at).filter(loan => {
                const loanEndDate = new Date(loan.fechaFin);
                const currentDate = new Date();
                return loanEndDate.getMonth() >= currentDate.getMonth() && loanEndDate.getFullYear() >= currentDate.getFullYear();
            }).map(loan => ({
                ...loan.toObject(),
                bookId: libro._id,
                uid: loan._id // Agrega el bookId a cada cuenta
            }));

            // Genera un nuevo token JWT
            const token = await generarJWT(uid);

            // Envía una respuesta JSON exitosa con la información de las cuentas actualizadas y el nuevo token
            res.json({
                success: true,
                message: 'Loan deleted successfully',
                data: loans,
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