const { Delivery } = require('../models/deliveryModel');
const sequelize = require('../config/database');

// Create a new delivery
exports.createDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.create(req.body);
        res.status(201).json(delivery);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
