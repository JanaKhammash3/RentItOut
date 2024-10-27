const { DataTypes } = require('sequelize');
const sequelize = require('./Sequelize');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false } // e.g., 'admin', 'customer', 'owner'
});

module.exports = User;
