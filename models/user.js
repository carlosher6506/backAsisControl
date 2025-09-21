const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name' 
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true 
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number' 
  },
  curp: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: true,
    validate: {
      len: [18, 18] 
    }
  },
  employeeNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'employee_number'
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

module.exports = User; 