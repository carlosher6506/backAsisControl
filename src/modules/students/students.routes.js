const express = require('express');
const router = express.Router();

const controller = require('./students.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearAlumno);

module.exports = router;