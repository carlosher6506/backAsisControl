const express = require('express');
const router = express.Router();

const controller = require('./schoolYear.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearCiclo);
router.get('/', auth,controller.obtenerCiclos);
router.get('/:id', auth,controller.obtenerCiclo);
router.delete('/:id',controller.eliminarCiclo);
router.put('/:id',auth,controller.actualizarCiclo);
router.patch('/:id/activar', auth, controller.activarCiclo);

module.exports = router;