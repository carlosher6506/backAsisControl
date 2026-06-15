const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');

router.post('/login', controller.login);
router.post('/registro', controller.registro);
router.get('/verificar/:token', controller.verificarEmail);
router.post('/solicitar-reset', controller.solicitarReset);
router.post('/reset-password', controller.resetPassword);
router.post('/reenviar-verificacion', controller.reenviarVerificacion);

module.exports = router;