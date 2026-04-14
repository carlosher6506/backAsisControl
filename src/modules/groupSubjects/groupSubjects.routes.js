const express = require('express');
const router = express.Router();
const controller = require('./groupSubjects.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', auth, controller.asignarMateria);
router.get('/', auth, controller.obtenerGrupoMaterias);
router.get('/grupo/:grupo_id', auth, controller.obtenerMateriasPorGrupo);
router.delete('/:id', auth, controller.eliminarGrupoMateria);

module.exports = router;