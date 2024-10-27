const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed

const Insurance = sequelize.define('Insurance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Reference to User table
            key: 'id',
        },
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items', // Reference to Item table
            key: 'id',
        },
    },
    coverageAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
    },
}, {
    timestamps: true,
});

module.exports = Insurance;
