const { response } = require("express");
const mongoose = require('mongoose');
const { generarJWT } = require('../helpers/jwt');
const Usuario = require("../models/usuario");

const create = async (req, res = response) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const uid = req.uid;
            const usuario = await Usuario.findById(uid);
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            const { nombre } = req.body;
            usuario.libros.push({ nombre });
            await usuario.save();

            // Filtrar los libros que no han sido eliminados suavemente
            const librosFiltrados = usuario.libros.filter(libro => !libro.deleted_at);

            const token = await generarJWT(uid);
            res.json({
                success: true,
                message: 'User created',
                data: librosFiltrados,
                token
            });
        });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Create failed'
        });
    } finally {
        session.endSession();
    }
};


const read = async (req, res = response) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const uid = req.uid;
            const usuario = await Usuario.findById(uid);

            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            // Filtrar los libros que no han sido eliminados suavemente
            const librosFiltrados = usuario.libros.filter(libro => !libro.deleted_at);

            const token = await generarJWT(uid);
            res.json({
                success: true,
                message: 'User details retrieved successfully',
                data: librosFiltrados,
                token
            });
        });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Read failed'
        });
    } finally {
        session.endSession();
    }
};


const update = async (req, res = response) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const uid = req.uid;
            const usuario = await Usuario.findById(uid);
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            const { libroId, nuevoNombre } = req.body;

            // Buscar el libro por su _id en el array de libros
            const libroIndex = usuario.libros.findIndex(libro => libro._id.toString() === libroId);

            // Verificar si el libro existe
            if (libroIndex === -1) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Actualizar el nombre del libro
            usuario.libros[libroIndex].nombre = nuevoNombre;

            // Guardar el usuario actualizado
            await usuario.save();

            // Filtrar los libros que no han sido eliminados suavemente
            const librosFiltrados = usuario.libros.filter(libro => !libro.deleted_at);

            const token = await generarJWT(uid);
            res.json({
                success: true,
                message: 'Book updated successfully',
                data: librosFiltrados,
                token
            });
        });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Update failed'
        });
    } finally {
        session.endSession();
    }
}



const destroy = async (req, res = response) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const uid = req.uid;
            const usuario = await Usuario.findById(uid);
            if (!usuario) {
                return res.json({
                    success: false,
                    message: 'The user doesn\'t exist'
                });
            }

            const { libroId } = req.body;

            // Buscar el libro por su _id en el array de libros
            const libroIndex = usuario.libros.findIndex(libro => libro._id.toString() === libroId);

            // Verificar si el libro existe
            if (libroIndex === -1) {
                return res.json({
                    success: false,
                    message: 'Book not found'
                });
            }

            // Marcar el libro como eliminado suavemente
            const libro = usuario.libros[libroIndex];
            libro.softDelete();

            // Usar save({ suppressWarning: true }) para ocultar la advertencia
            await libro.save({ suppressWarning: true });

            // Guardar el usuario actualizado
            await usuario.save();

            // Filtrar los libros que no han sido eliminados suavemente
            const librosFiltrados = usuario.libros.filter(libro => !libro.deleted_at);

            const token = await generarJWT(uid);
            res.json({
                success: true,
                message: 'Book deleted successfully',
                data: librosFiltrados,
                token
            });
        });
    } catch (error) {
        console.error('Error during transaction:', error);
        res.json({
            success: false,
            message: 'Delete failed'
        });
    } finally {
        session.endSession();
    }
}




module.exports = {
    create,
    read,
    update,
    destroy
}