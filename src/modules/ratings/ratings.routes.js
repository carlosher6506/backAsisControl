const express = require('express');
const router = express.Router();

const controller = require('./ratings.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.calificar);
router.get('/',auth,controller.obtenerCalificaciones);
router.get('/:id',auth,controller.obtenerCalificacion);
router.delete('/:id',auth,controller.eliminarCalificacion);
router.put('/:id',auth,controller.actualizarCalificacion);

module.exports = router;