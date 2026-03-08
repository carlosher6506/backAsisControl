const express = require('express');
const router = express.Router();

const controller = require('./users.controller');

const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.post(
    '/',
    auth,
    role(['admin']),
    controller.crearUsuario
);

module.exports = router;