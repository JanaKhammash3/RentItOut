const {Rental} = require('../models/rentalModel'); // Sequelize Rental model
const {Item} = require('../models/itemModel'); // Sequelize Item model
const {User} = require('../models/userModel'); // Sequelize User model


// POST /rentals: Start a new rental
exports.startRental = async (req, res, next) => {
    try {
        const { itemId, renterId, startDate, endDate } = req.body;

        // Fetch item to get pricing information
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

         // Validate renter existence
         const renter = await User.findByPk(renterId);
         if (!renter) {
             return res.status(404).json({ message: 'Renter not found' });
         }

        // Calculate total rental cost (price per day)
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = rentalDays * item.pricePerDay;

        // Create the new rental in the database
        const newRental = await Rental.create({
            itemId,
            renterId,
            startDate,
            endDate,
            totalCost,
        });

      res.status(201).json({
            success: true,
            message: 'Rental started successfully',
            rental: newRental,
        })
     } catch (error) {
        next(error);
    }
};

// GET /rentals: View all rentals
exports.getRentals = async (req, res, next) => {
    try {
        const rentals = await Rental.findAll({
            include: [{ model: Item, as: 'item' }, { model: User, as: 'renter' }], // Assuming associations are defined
        });
        res.status(200).json(rentals);
    } catch (error) {
        next(error);
    }
};

// PUT /rentals/:rentalId: Update rental period and recalculate cost
exports.updateRental = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body;
        const rental = await Rental.findByPk(req.params.rentalId);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Recalculate total cost
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const item = await Item.findByPk(rental.itemId);
        const totalCost = rentalDays * item.pricePerDay;

        // Update rental details
        rental.startDate = startDate;
        rental.endDate = endDate;
        rental.totalCost = totalCost;
        await rental.save();

        res.status(200).json(rental);
    } catch (error) {
        next(error);
    }
};

// DELETE /rentals/:rentalId: Cancel a rental
exports.cancelRental = async (req, res, next) => {
    try {
        const rental = await Rental.findByPk(req.params.rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Set status to 'canceled'
        rental.status = 'canceled';
        await rental.save();

        res.status(200).json({
            success: true,
            message: 'Rental canceled',
            rental,
        });
        } catch (error) {
        next(error);
    }
};
