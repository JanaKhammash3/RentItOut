const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Rental = sequelize.define('rental', {
    itemId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'items', 
            key: 'id',
        },
    },
    renterId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', 
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
        type: DataTypes.FLOAT, 
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'canceled'),
        defaultValue: 'active',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
    },
}, {
    timestamps: true, 
});


module.exports = Rental;
