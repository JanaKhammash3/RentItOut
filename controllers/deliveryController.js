const { Delivery } = require('../models/deliveryModel');
const { Item } = require('../models/itemModel'); // Check item availability
const sequelize = require('../config/database');

// Create a new delivery with validations
exports.createDelivery = async (req, res) => {
    const { itemId, pickupLocation } = req.body;

    try {
        // Validate item availability
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found or unavailable' });
        }

        if (!pickupLocation) {
            return res.status(400).json({ message: 'Pickup location is required' });
        }

        const delivery = await Delivery.create({
            userId: req.user.id,
            itemId,
            pickupLocation,
        });

        res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
    } catch (error) {
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
