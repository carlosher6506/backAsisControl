const express = require('express');
const router = express.Router();

const controller = require('./tasks.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearTarea);

module.exports = router;