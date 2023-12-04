/**
 * path: api/login
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { crearUsuario } = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.post('/', [
    check('googleId', 'Your Google credentials are not valid.').not().isEmpty(),
    validarCampos
], crearUsuario);

module.exports = router;