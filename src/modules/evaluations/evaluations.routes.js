const express = require('express');
const router = express.Router();

const controller = require('./evaluations.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.configurarEvaluacion);

module.exports = router;