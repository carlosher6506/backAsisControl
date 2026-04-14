const express = require('express');
const cors = require('cors');
const { crearUsuario } = require('./modules/users/users.controller');
require('./config/database');
require('./utils/createAdmin')();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/academicLevels', require('./modules/academicLevels/academicLevels.routes'));
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/educationLevels', require('./modules/edcuationLevels/educationLevels.routes'));
app.use('/api/evaluations', require('./modules/evaluations/evaluations.routes'));
app.use('/api/groups', require('./modules/groups/groups.routes'));
app.use('/api/ratings', require('./modules/ratings/ratings.routes'));
app.use('/api/schoolYear', require('./modules/schoolYear/schoolYear.routes'));
app.use('/api/students', require('./modules/students/students.routes'));
app.use('/api/tasks', require('./modules/tasks/tasks.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/etiquetas', require('./modules/labels/labels.routes'));
app.use('/api/subjects', require('./modules/subjects/subjects.routes'));
app.use('/api/groupSubjects', require('./modules/groupSubjects/groupSubjects.routes'));
app.use('/api/profile', require('./modules/profile/profile.routes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'backend is working!' });
});

module.exports = app;