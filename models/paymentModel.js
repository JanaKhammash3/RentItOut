const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as necessary

const Payment = sequelize.define('payments', {
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
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rentals', // Reference to Rental table
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
        type: DataTypes.STRING, // Store payment status (e.g., 'confirmed', 'pending')
        allowNull: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = Payment;
