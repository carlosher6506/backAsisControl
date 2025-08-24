const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user'); // Relación con User

const Student = sequelize.define('Student', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING(20)
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'students',
  timestamps: false
});

module.exports = Student;