const { DataTypes } = require('sequelize');
const sequelize = require('./Sequelize'); // Ensure this points to your Sequelize instance

const User = sequelize.define('user', {
  name: { type: DataTypes.STRING, allowNull: false }, // Changed to name
  email: { type: DataTypes.STRING, allowNull: false, unique: true }, // Added email
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }, // Added isVerified
  // Password and role fields should be added if needed
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = User;
