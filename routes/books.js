/**
 * path: api/books
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { create, read, update, destroy } = require('../controllers/books');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/create', [
    check('nombre', 'The name is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], create);

router.get('/', validarJWT, read);

router.post('/update', [
    check('libroId', 'The book is required.').not().isEmpty(),
    check('nuevoNombre', 'The name is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], update);

router.post('/destroy', [
    check('libroId', 'The book is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], destroy);

module.exports = router;