const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // adjust as needed

class Review extends Model {}

Review.init({
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users', // Adjust if your Users table is named differently
            key: 'id'
        }
    },
    reviewerId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews', // Make sure this matches your database table name
});

module.exports = Review;
