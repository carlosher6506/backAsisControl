const express = require('express');
const router = express.Router();
const controller = require('./profile.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/', auth, controller.obtenerPerfil);
router.post('/', auth, controller.guardarPerfil);

module.exports = router;