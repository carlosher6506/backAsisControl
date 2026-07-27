const express = require('express');
const router = express.Router();
const ctrl = require('./admin.controller');
const verificarToken = require('../../middlewares/auth.middleware');
const verificarRol = require('../../middlewares/role.middleware')

router.get('/usuarios-actividad', verificarToken, verificarRol(['admin']), ctrl.getUsuariosActividad);
router.get('/actividad-semanal',  verificarToken, verificarRol(['admin']), ctrl.getActividadSemanal);

module.exports = router;