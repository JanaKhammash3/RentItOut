const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

class Review extends Model{}

Review.init({
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5, 
        },
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users', 
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
    tableName: 'reviews', 
});

module.exports = Review;
