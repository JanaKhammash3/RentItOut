const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path to your DB config

const Insurance = sequelize.define('insurance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'id',
        },
    },
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null if insurance is not linked to a rental
        references: {
            model: 'rentals',
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