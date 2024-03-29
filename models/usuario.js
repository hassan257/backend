const mongoose = require('mongoose');
const { Schema } = mongoose;
const Libro = require('./libro');

const UsuarioSchema = Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    libros: [Libro.schema],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null
    }
});

// Actualizar la marca de tiempo al actualizar el documento
UsuarioSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Lógica para marcar como eliminado suavemente
UsuarioSchema.method('softDelete', function () {
    this.deleted_at = new Date();
    return this.save();
});

UsuarioSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;