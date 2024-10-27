
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path to your DB config

const Item = sequelize.define('Items', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('tools', 'vehicles', 'electronics', 'furniture', 'others'), // Enum for categories
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    pricePerDay: { // Renamed from price to pricePerDay to maintain consistency
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    ownerId: { // Assuming ownerId refers to the User who owns the item
        type: DataTypes.INTEGER, // Adjust based on your User ID type
        allowNull: false,
        references: {
            model: 'Users', // Adjust this to your actual Users table name
            key: 'id',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = Item;
