const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para capturar errores
app.use((err, req, res, next) => {
  console.error(err.stack); // Loggea el error completo
  res.status(500).json({ error: 'Algo salió mal', details: err.message });
});

app.use('/api/auth', authRoutes, (req, res, next) => {
  console.log('Ruta /api/auth activa');
  next();
});
app.use('/api/attendances', attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});



module.exports = app;