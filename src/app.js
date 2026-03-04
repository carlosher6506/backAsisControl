const express = require('express');
const cors = require('cors');
require('./config/database');
require('./utils/createAdmin')();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./modules/auth/auth.routes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'backend is working!' });
});

module.exports = app;