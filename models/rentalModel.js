const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as necessary

// const { Rental, Item, User } = require('../models/associations');
const Rental = sequelize.define('rentals', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    renterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deliveryMethod: {
        type: DataTypes.ENUM('delivery', 'pickup-point', 'in-person'),
        allowNull: false,
    },
    totalCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    latitude: {  // Add latitude field
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: { // Add longitude field
        type: DataTypes.FLOAT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
    },
}, {
    timestamps: true,
});

module.exports = Rental;
