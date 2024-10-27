const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed

// Define the User model
const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, // Make sure this field is required
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationDocuments: {
        type: DataTypes.JSON, 
    },
}, { 
    timestamps: true 
});

// Define the Review model
const Review = sequelize.define('reviews', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
    },
});

// Relationships: A user can receive many reviews, and reviews are given by other users
User.hasMany(Review, { foreignKey: 'reviewerId' }); // Reviews written by this user
User.hasMany(Review, { foreignKey: 'userId' });     // Reviews received by this user

// Export the models
module.exports = { User, Review };
