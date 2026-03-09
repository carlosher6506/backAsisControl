const express = require('express');
const router = express.Router();

const controller = require('./evaluations.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.configurarEvaluacion);
router.get('/',auth,controller.obtenerEvaluaciones);
router.get('/:id',auth,controller.obtenerEvaluacionPorId);
router.put('/:id',auth,controller.actualizarEvaluacion);
router.delete('/:id',auth,controller.eliminarEvaluacion);

module.exports = router;