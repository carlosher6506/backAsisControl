const express = require('express');
const router = express.Router();

const controller = require('./groups.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearGrupo);
router.get('/',auth,controller.obtenerGrupos);
router.get('/:id',auth,controller.obtenerGrupoPorId);
router.put('/:id',auth,controller.actualizarGrupo);
router.delete('/:id',auth,controller.eliminarGrupo);

module.exports = router;