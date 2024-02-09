const mongoose = require('mongoose');
const { Schema } = mongoose;

const LoanSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    cuentaId: {
        type: String,
        default: null
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
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
LoanSchema.pre('save', function (next) {
    try {
        this.updated_at = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Lógica para marcar como eliminado suavemente
LoanSchema.method('softDelete', function () {
    this.deleted_at = new Date.now();
    return this.save({ suppressWarning: true });
});

// Modificar el método toJSON para cambiar _id a uid
LoanSchema.method('toJSON', function () {
    const { _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

const Loan = mongoose.model('Loan', LoanSchema);

module.exports = Loan;
