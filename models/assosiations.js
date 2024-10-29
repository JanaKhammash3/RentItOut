const Rental = require('./rentalModel');
const Item = require('./itemModel');
const {User} = require('./userModel'); // Assuming User model is already defined

// Define associations
Rental.belongsTo(Item, { foreignKey: 'itemId' });  // Each Rental belongs to a specific Item
Item.hasMany(Rental, { foreignKey: 'itemId' });  // Each Item can have multiple Rentals

Rental.belongsTo(User, { as: 'renter', foreignKey: 'renterId' });
User.hasMany(Rental, { foreignKey: 'renterId', as: 'rentals' });

module.exports = { Rental, Item, User };