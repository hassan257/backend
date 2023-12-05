/**
 * path: api/login
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { googleAuth } = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.post('/google', [
    check('token', 'Your Google credentials are not valid.').not().isEmpty(),
    validarCampos
], googleAuth);

module.exports = router;