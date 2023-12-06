/**
 * path: api/login
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { googleAuth, renewToken } = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/google', [
    check('token', 'Your Google credentials are not valid.').not().isEmpty(),
    validarCampos
], googleAuth);

router.get('/renew', validarJWT, renewToken);

module.exports = router;