const express = require('express');
const router = express.Router();

const controller = require('./academicLevels.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.get('/',auth,controller.obtenerNivelesAcademicos);
router.post('/',auth,role(['admin']),controller.crearNivelAcademico);
router.get('/:id',auth,controller.obtenerNivelAcademicoPorId);
router.put('/:id',auth,role(['admin']),controller.actualizarNivelAcademico);
router.delete('/:id',auth,role(['admin']),controller.eliminarNivelAcademico);

module.exports = router;