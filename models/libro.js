const mongoose = require('mongoose');
const Account = require('./account');
const Loan = require('./loan');
const { Schema } = mongoose;

const LibroSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    accounts: [Account.schema],
    loans: [Loan.schema],
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
LibroSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Lógica para marcar como eliminado suavemente
LibroSchema.method('softDelete', function () {
    this.deleted_at = new Date();
    return this.save({ suppressWarning: true });
});

// Modificar el método toJSON para cambiar _id a uid
LibroSchema.method('toJSON', function () {
    const { _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

const Libro = mongoose.model('Libro', LibroSchema);

module.exports = Libro;
