const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    saldo: {
        type: Number,
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
AccountSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Lógica para marcar como eliminado suavemente
AccountSchema.method('softDelete', function () {
    this.deleted_at = new Date();
    return this.save({ suppressWarning: true });
});

// Modificar el método toJSON para cambiar _id a uid
AccountSchema.method('toJSON', function () {
    const { _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
