const express = require('express');
const router = express.Router();

const controller = require('./ratings.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth, controller.calificar);
router.get('/', auth, controller.obtenerCalificaciones);
router.get('/alumno/:alumno_id/grupoMateria/:grupo_materia_id', auth, controller.obtenerCalificacionesPorAlumno);
router.delete('/:id', auth, controller.eliminarCalificacion);
router.put('/:id', auth, controller.actualizarCalificacion);
router.get('/boleta/:alumno_id', auth, controller.obtenerBoleta);

module.exports = router;