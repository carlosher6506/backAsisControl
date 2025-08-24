const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['super_admin', 'admin', 'teacher', 'student']]
    }
  }
}, {
  tableName: 'users',
  timestamps: false
});

console.log('Modelo User definido:', User); // Depuración
module.exports = User;