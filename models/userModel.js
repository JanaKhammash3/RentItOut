const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

// Define review model 
const Review = sequelize.define('reviews', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5, 
        },
    },
    //the comment is optional(not needed)
    comment: {
        type: DataTypes.TEXT,
        allowNull: true, 
    },
});

// Define User model
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
        allowNull: false, 
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
            //phone should be only numbers
            isNumeric: true, 
        },
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            //id should be only numbers
            isNumeric: true, 
        },
    },
    address: {
        type: DataTypes.STRING, 
        //optional
        allowNull: true, 
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user', 
        validate: {
            isIn: [['user', 'admin']], 
        },
    },
}, { 
    timestamps: true 
});

//the user can recieve reviews 
User.hasMany(Review, { foreignKey: 'userId', as: 'reviewsReceived' }); 
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 

User.hasMany(Review, { foreignKey: 'reviewerId', as: 'reviewsGiven' }); 
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' }); 

module.exports = { User, Review };
