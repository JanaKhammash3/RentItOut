const Rental = require('./rentalModel');
const Insurance = require('./insuranceModel');
const Item = require('./itemModel');
const Payment = require('./paymentModel');
const { User } = require('./userModel');

// Associations for Insurance and Rental
Rental.hasOne(Insurance, { foreignKey: 'rentalId', as: 'insurance' });
Insurance.belongsTo(Rental, { foreignKey: 'rentalId' });
Insurance.belongsTo(User, { foreignKey: 'userId' });
Insurance.belongsTo(Item, { foreignKey: 'itemId' });

// Associations for Rental and User
Rental.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });
Rental.belongsTo(Item, { foreignKey: 'itemId' });


Item.hasMany(Rental, { foreignKey: 'itemId', as: 'rentals' }); // Add this line

// New association between Rental and Payment
Rental.hasMany(Payment, { foreignKey: 'rentalId', as: 'payments' });
Payment.belongsTo(Rental, { foreignKey: 'rentalId', as: 'rentals' }); // Payment belongs to a Rental
console.log("Item associations:", Payment.associations);
console.log("Rental associations:", Rental.associations);

module.exports = { Rental, Payment, Insurance, Item, User };