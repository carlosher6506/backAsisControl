const express = require('express');
const router = express.Router();
const controller = require('./subjects.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth, controller.crearMateria);
router.get('/', auth, controller.obtenerMaterias);
router.put('/:id', auth, controller.actualizarMateria);
router.delete('/:id', auth, controller.eliminarMateria);

module.exports = router;