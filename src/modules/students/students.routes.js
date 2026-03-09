const express = require('express');
const router = express.Router();

const controller = require('./students.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearAlumno);
router.get('/',auth,controller.obtenerAlumnos);
router.get('/:id',auth,controller.obtenerAlumnoPorId);
router.put('/:id',auth,controller.actualizarAlumno);
router.delete('/:id',auth,controller.eliminarAlumno);

module.exports = router;