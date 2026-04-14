const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');

router.post('/login', controller.login);
router.post('/registro', controller.registro);

module.exports = router;