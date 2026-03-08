const express = require('express');
const router = express.Router();

const controller = require('./ratings.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/',auth,controller.calificar);

module.exports = router;