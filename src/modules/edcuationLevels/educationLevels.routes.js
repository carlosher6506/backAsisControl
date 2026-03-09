const express = require('express');
const router = express.Router();

const controller = require('./educationLevels.controller');
const role = require('../../middlewares/role.middleware')
const auth = require('../../middlewares/auth.middleware');

router.get('/', auth,controller.obtenerNiveles);
router.get('/:id', auth,controller.obtenerNivelPorId);
router.post('/', auth,role(['admin']),controller.crearNivelEducativo);
router.put('/:id', auth,role(['admin']),controller.actualizarNivel);
router.delete('/:id', auth, role(['admin']),controller.eliminarNivel);

module.exports = router;