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
            isEmail: true, // Validates email format
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, // Make sure this field is required
        validate: {
            len: {
                args: [5, Infinity],
                msg: "Password must be at least 5 characters long.",
            },
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true, // Phone must be numeric
        },
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isNumeric: true, // ID must be numeric
        },
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationDocuments: {
        type: DataTypes.JSON,
        allowNull: true, // Allow this field to be null
    },
}, { 
    timestamps: true 
});

// Define the Review model
const Review = sequelize.define('reviews', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5, // Assuming a rating scale of 1 to 5
        },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true, // Make comment optional
    },
});

// Relationships: A user can receive many reviews, and reviews are given by other users
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'reviewsGiven' }); // Reviews written by this user
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' }); // Each review is associated with a user

User.hasMany(Review, { foreignKey: 'userId', as: 'reviewsReceived' }); // Reviews received by this user
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Each review is associated with the user being reviewed

// Export the models
module.exports = { User, Review };
