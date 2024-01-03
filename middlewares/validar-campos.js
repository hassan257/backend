const { validationResult } = require('express-validator');
const validarCampos = (req, res, next) => {
    const token = req.header('x-token');
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.json({
            success: false,
            message: errores.errors[0].msg,
            data: errores.mapped(),
            token: token
        })
    }
    next();
}

module.exports = {
    validarCampos
}