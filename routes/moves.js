/**
 * path: api/moves
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { create, read, update, destroy } = require('../controllers/moves');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/create', [
    check('bookId', 'The book is required.').notEmpty(),
    check('cantidad', 'The amount is required.').notEmpty().isFloat(),
    check('categoriaId', 'The category is required.').notEmpty(),
    check('cuentaId', 'The account is required.').notEmpty(),
    check('conceptoId', 'The concept is required.').notEmpty(),
    check('fecha', 'The date is required.').notEmpty().isISO8601(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('tipoMovimientoId', 'The move\'s type is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], create);

router.get('/', [
    check('bookId', 'The book is required.').notEmpty(),
    check('cuentaId', 'The account is required.'),
    validarJWT,
    validarCampos
], read);

router.post('/update', [
    check('bookId', 'The book is required.').notEmpty(),
    check('cantidad', 'The amount is required.').notEmpty().isFloat(),
    check('categoriaId', 'The category is required.').notEmpty(),
    check('accountId', 'The account is required.').notEmpty(),
    check('conceptoId', 'The concept is required.').notEmpty(),
    check('fecha', 'The date is required.').notEmpty().isISO8601(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('tipoMovimientoId', 'The move\'s type is required.').not().isEmpty(),
    check('moveId', 'The move is required.').notEmpty(),
    validarJWT,
    validarCampos
], update);

router.post('/destroy', [
    check('bookId', 'The book is required.').not().isEmpty(),
    check('accountId', 'The book is required.').not().isEmpty(),
    check('moveId', 'The move is required.').notEmpty(),
    validarJWT,
    validarCampos
], destroy);

module.exports = router;