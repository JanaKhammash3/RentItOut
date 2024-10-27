const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as necessary

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
