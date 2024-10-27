const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ensure you have the correct path

const Rental = sequelize.define('Rental', {
    itemId: { // Using itemId instead of item for clarity in MySQL
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items', // This should match the actual table name in MySQL
            key: 'id',
        },
    },
    renterId: { // Using renterId instead of renter for clarity in MySQL
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // This should match the actual table name in MySQL
            key: 'id',
        },
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    totalCost: {
        type: DataTypes.FLOAT, // Use FLOAT or DECIMAL based on your precision needs
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'canceled'),
        defaultValue: 'active',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically sets the current date
    },
}, {
    timestamps: true, // Automatically adds updatedAt field
});

// Export the Rental model
module.exports = Rental;
