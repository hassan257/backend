const mongoose = require('mongoose');
const { Schema } = mongoose;

const MoveSchema = new Schema({
    cantidad: {
        type: Number,
        required: true
    },
    categoriaId: {
        type: String,
        required: true
    },
    // cuentaId: {
    //     type: String,
    //     required: true
    // },
    conceptoId: {
        type: String,
        required: true
    },
    fecha: {
        type: Date
    },
    nombre: {
        type: String,
        required: true
    },
    tipoMovimientoId: {
        type: String,
        required: true
    },
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
MoveSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Lógica para marcar como eliminado suavemente
MoveSchema.method('softDelete', function () {
    this.deleted_at = new Date();
    return this.save({ suppressWarning: true });
});

// Modificar el método toJSON para cambiar _id a uid
MoveSchema.method('toJSON', function () {
    const { _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

const Move = mongoose.model('Move', MoveSchema);

module.exports = Move;
