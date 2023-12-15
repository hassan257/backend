/**
 * path: api/accounts
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { create, read, update, destroy } = require('../controllers/accounts');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/create', [
    check('bookId', 'The book is required.').notEmpty(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('saldo', 'The balance is required.').notEmpty().isFloat(),
    validarJWT,
    validarCampos
], create);

router.get('/', [
    check('bookId', 'The book is required.').notEmpty(),
    validarJWT,
    validarCampos
], read);

router.post('/update', [
    check('bookId', 'The book is required.').not().isEmpty(),
    check('accountId', 'The book is required.').not().isEmpty(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('saldo', 'The balance is required.').notEmpty().isFloat(),
    validarJWT,
    validarCampos
], update);

router.post('/destroy', [
    check('bookId', 'The book is required.').not().isEmpty(),
    check('accountId', 'The book is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], destroy);

module.exports = router;