const express = require('express');
const router = express.Router();

const controller = require('./groups.controller');

const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.crearGrupo);

module.exports = router;