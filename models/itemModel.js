const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Item = sequelize.define('items', {
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
        type: DataTypes.ENUM('tools', 'vehicles', 'electronics', 'furniture', 'others'), 
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    pricePerDay: { 
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    ownerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id',
        },
    },
}, {
    timestamps: true, 
});

module.exports = Item;
