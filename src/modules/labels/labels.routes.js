const express = require('express');
const router = express.Router();
const controller = require('./labels.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth, controller.crearEtiqueta);
router.get('/', auth, controller.obtenerEtiquetas);
router.get('/configuracion/:configuracion_id', auth, controller.obtenerEtiquetasPorConfiguracion);
router.put('/:id', auth, controller.actualizarEtiqueta);
router.delete('/:id', auth, controller.eliminarEtiqueta);

module.exports = router;