const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./userModel'); 
const Rental = require('./rentalModel');  

const Delivery = sequelize.define('deliveries', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    pickupLocation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deliveryStatus: {
        type: DataTypes.ENUM('Pending', 'In Transit', 'Completed'),
        defaultValue: 'Pending',
    },
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Rental,
            key: 'id',
        },
    },
    deliveryLocation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'deliveries',
});

module.exports = Delivery;
