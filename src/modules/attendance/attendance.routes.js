const express = require('express');
const router = express.Router();
const controller = require('./attendance.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/subjects', auth, controller.obtenerMateriasDelGrupo);
router.post('/session', auth, controller.crearOEntrarSesion);
router.get('/session/:id/list', auth, controller.obtenerListaSesion);
router.patch('/session/:id/close', auth, controller.cerrarSesion);
router.patch('/register', auth, controller.registrarManual);
router.post('/register-qr', auth, controller.registrarQr);
router.get('/report', auth, controller.obtenerReporte);
router.get('/qr/:alumno_id', auth, controller.obtenerQrAlumno);
router.patch('/qr/:alumno_id/regenerate', auth, controller.regenerarQrAlumno);
 
module.exports = router;