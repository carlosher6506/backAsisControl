const express    = require('express');
const router     = express.Router();
const ctrl = require('./admin.controller');
const verificarToken = require('../../middlewares/auth.middleware');

// Middleware inline para verificar rol admin
const esAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

router.get('/usuarios-actividad', verificarToken, esAdmin, ctrl.getUsuariosActividad);
router.get('/actividad-semanal',  verificarToken, esAdmin, ctrl.getActividadSemanal);

module.exports = router;