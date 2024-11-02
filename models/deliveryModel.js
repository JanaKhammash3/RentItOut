const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if needed
const User = require('./userModel'); // Adjust if User model is in a different folder
//const Item = require('./itemModel'); // Adjust if Item model is in a different folder
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
    tableName: 'deliveries', // Optional: Specify table name if needed
});

module.exports = Delivery;
