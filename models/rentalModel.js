const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 


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
    latitude: {  
        type: DataTypes.FLOAT,
        allowNull: true
    },
    longitude: {
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
