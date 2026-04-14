const express = require('express');
const router = express.Router();
const controller = require('./tasks.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth, controller.crearTarea);
router.get('/', auth, controller.obtenerTareas);
router.get('/grupoMateria/:grupo_materia_id', auth, controller.obtenerTareasPorGrupoMateria);
router.put('/:id', auth, controller.actualizarTarea);
router.delete('/:id', auth, controller.eliminarTarea);

module.exports = router;