const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Insurance = sequelize.define('insurance', {
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
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items',
            key: 'id',
        },
    },
    rentalId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'rentals',
            key: 'id',
        },
    },
    coverageAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
    },
}, {
    timestamps: true,
});

module.exports = Insurance;