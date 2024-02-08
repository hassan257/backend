/**
 * path: api/loans
 */
const { Router } = require('express');
const { check } = require('express-validator');
const { create, read, update, destroy } = require('../controllers/moves');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/create', [
    check('bookId', 'The book is required.').notEmpty(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('cantidad', 'The amount is required.').notEmpty().isFloat(),
    check('fechaInicio', 'The begin date is required.').notEmpty().isISO8601(),
    check('fechaFin', 'The end date is required.').notEmpty().isISO8601(),
    check('tipoMovimientoId', 'The move\'s type is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], create);

router.get('/', [
    check('bookId', 'The book is required.').notEmpty(),
    validarJWT,
    validarCampos
], read);

router.post('/update', [
    check('bookId', 'The book is required.').notEmpty(),
    check('loanId', 'The loan is required.').notEmpty(),
    check('nombre', 'The name is required.').not().isEmpty(),
    check('cantidad', 'The amount is required.').notEmpty().isFloat(),
    check('fechaInicio', 'The date is required.').notEmpty().isISO8601(),
    check('fechaFin', 'The date is required.').notEmpty().isISO8601(),
    check('tipoMovimientoId', 'The move\'s type is required.').not().isEmpty(),
    validarJWT,
    validarCampos
], update);

router.post('/destroy', [
    check('bookId', 'The book is required.').not().isEmpty(),
    check('loanId', 'The loan is required.').notEmpty(),
    validarJWT,
    validarCampos
], destroy);

module.exports = router;