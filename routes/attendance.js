const express = require('express');
const Attendance = require('../models/attendance');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'student') {
      whereClause.student_id = req.user.id; // Asumiendo que student_id = user.id
    }
    const attendances = await Attendance.findAll({ where: whereClause });
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo asistencias' });
  }
});

router.post('/', verifyToken, requireRole(['super_admin', 'admin', 'teacher']), async (req, res) => {
  const { studentId, status, date } = req.body;
  try {
    await Attendance.create({ student_id: studentId, status, date, recorded_by: req.user.id });
    res.json({ message: 'Asistencia registrada' });
  } catch (err) {
    res.status(500).json({ error: 'Error registrando asistencia' });
  }
});

module.exports = router;