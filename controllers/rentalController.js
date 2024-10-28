const {Rental} = require('../models/rentalModel');  // Sequelize Rental model
const Item = require('../models/itemModel');  // Sequelize Item model
const { User } = require('../models/userModel');  // Sequelize User model


// POST /rentals: Start a new rental
exports.startRental = async (req, res, next) => {
    console.log('startRental function reached');
    try {
        const { itemId, startDate, endDate } = req.body;  // Only include itemId and rental dates
        const renterId = req.user?.id || 1;  // Extract renterId from the authenticated user

        // Fetch item to get pricing information
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the item is available
        if (!item.isAvailable) {
            return res.status(400).json({ message: 'Item is not available for rent' });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Calculate total rental cost (price per day)
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = rentalDays * item.pricePerDay;

        // Create the new rental in the database
        const newRental = await Rental.create({
            itemId,
            renterId,  // Use authenticated user's ID
            startDate,
            endDate,
            totalCost,
        });

        // Mark the item as unavailable after the rental is started
        item.isAvailable = false;
        await item.save();

        res.status(201).json({
            success: true,
            message: 'Rental started successfully',
            rental: newRental,
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        next(error);
    }
};

// GET /rentals: View all rentals
exports.getRentals = async (req, res, next) => {
    console.log('getRentals function reached');
    try {
        const rentals = await Rental.findAll({
            include: [
                { model: Item },
                { model: User, as: 'renter' }
            ],
        });
        res.status(200).json(rentals);
    } catch (error) {
        console.error('Error in getRentals:', error);
        res.status(500).json({ error: error.message });
    }
};
// PUT /rentals/:rentalId: Update rental period and recalculate cost
exports.updateRental = async (req, res, next) => {
    console.log('updateRental function reached'); 
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
    console.log('cancelRental function reached');  // Log to confirm function execution
    try {
        const rental = await Rental.findByPk(req.params.rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Delete the rental record from the database
        await rental.destroy();

        res.status(200).json({
            success: true,
            message: 'Rental deleted successfully'
        });
    } catch (error) {
        console.error('Error in cancelRental:', error);  // Log any errors
        next(error);
    }
};

