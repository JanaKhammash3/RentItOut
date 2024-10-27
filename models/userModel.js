const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path as needed

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
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationDocuments: {
        type: DataTypes.JSON, // Can store file paths as an array of strings
    },
}, { 
    timestamps: true 
});

// Define association for self-referencing reviews
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
User.hasMany(Review, { foreignKey: 'reviewerId' });
User.hasMany(Review, { foreignKey: 'userId' });

module.exports = { User, Review };
