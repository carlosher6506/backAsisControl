const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./student');
const User = require('./user'); // Relación con User

const Attendance = sequelize.define('Attendance', {
  student_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Student,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'attendances',
  timestamps: false
});

module.exports = Attendance;