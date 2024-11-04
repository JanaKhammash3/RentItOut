const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Payment = sequelize.define('payments',{
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
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rentals', 
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card'),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Payment;
