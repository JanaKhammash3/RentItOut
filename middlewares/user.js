const { DataTypes } = require('sequelize');
const sequelize = require('./Sequelize'); 

const User = sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false }, 
  email: { type: DataTypes.STRING, allowNull: false, unique: true }, 
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }, 
 
}, {
  timestamps: true, 
});

module.exports = User;
