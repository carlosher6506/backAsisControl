const express = require('express');
const router = express.Router();

const controller = require('./users.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.post('/',auth,role(['admin']),controller.crearUsuario);
router.get('/',auth,role(['admin']),controller.obtenerUsuarios);
router.get('/:id',auth,role(['admin']),controller.obtenerUsuarioPorId);
router.put('/:id',auth,role(['admin']),controller.actualizarUsuario);
router.delete('/:id',auth,role(['admin']),controller.eliminarUsuario);


module.exports = router;