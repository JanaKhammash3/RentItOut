// models/associations.js or similar file
const Rental = require('./rentalModel');
const Insurance = require('./insuranceModel');
const Item = require('./itemModel');
const { User } = require('./userModel');

// Associations for Insurance and Rental
Rental.hasOne(Insurance, { foreignKey: 'rentalId', as: 'insurance' });
Insurance.belongsTo(Rental, { foreignKey: 'rentalId' });
Insurance.belongsTo(User, { foreignKey: 'userId' });
Insurance.belongsTo(Item, { foreignKey: 'itemId' });

// Associations for Rental and User
Rental.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });
Rental.belongsTo(Item, { foreignKey: 'itemId' });

// Define the reverse association from Item to Rental
Item.hasMany(Rental, { foreignKey: 'itemId', as: 'rentals' }); // Add this line
console.log("Item associations:", Item.associations);
console.log("Rental associations:", Rental.associations);


module.exports = { Rental, Insurance, Item, User };
