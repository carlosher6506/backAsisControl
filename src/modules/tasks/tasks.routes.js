const express = require('express');
const router = express.Router();

const controller = require('./tasks.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearTarea);
router.get('/',auth,controller.obtenerTareas);
router.get('/:id',auth,controller.obtenerTareaPorId);
router.delete('/:id',auth,controller.eliminarTarea);
router.put('/:id',auth,controller.actualizarTarea);

module.exports = router;