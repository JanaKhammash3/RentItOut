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
        type: DataTypes.STRING, // Store the payment method ID from Stripe
    },
    status: {
        type: DataTypes.STRING, // Store Stripe's status (e.g., 'succeeded')
        allowNull: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = Payment;