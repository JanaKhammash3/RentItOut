const Delivery = require('../models/deliveryModel');
// const { Item } = require('../models/itemModel'); // Check item availability
const Rental = require('../models/rentalModel');
// const sequelize = require('../config/database');

// Create a new delivery with validations
exports.createDelivery = async (req, res) => {
    const { rentalId, pickupLocation } = req.body;

    try {
        // Validate item availability
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found ' });
        }

        if (rental.deliveryMethod !== 'delivery' || rental.status !== 'active') {
            return res.status(400).json({ message: 'Rental is not eligible for delivery' });
        }

        if (!pickupLocation) {
            return res.status(400).json({ message: 'Pickup location is required' });
        }

        const delivery = await Delivery.create({
            userId: req.user.id,
            rentalId,
            pickupLocation,
        });

        await Rental.update(
            { status: 'in-delivery' }, // New status
            { where: { id: rentalId } } // Condition
        );

        console.log('Created Delivery:', delivery);

        res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll();
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
