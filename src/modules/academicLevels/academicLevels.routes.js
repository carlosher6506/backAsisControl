const express = require('express');
const router = express.Router();

const controller = require('./academicLevels.controller');

const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.get('/',auth,controller.obtenerNivelesAcademicos);

router.post(
    '/',
    auth,
    role(['admin']),
    controller.crearNivelAcademico
);

module.exports = router;