const express = require('express');
const router = express.Router();

const controller = require('./educationLevels.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearNivelEducativo);
router.post('/',auth,controller.obtenerNiveles);

module.exports = router;