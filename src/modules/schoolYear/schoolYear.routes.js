const express = require('express');
const router = express.Router();

const controller = require('./schoolYear.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearCiclo);

module.exports = router;