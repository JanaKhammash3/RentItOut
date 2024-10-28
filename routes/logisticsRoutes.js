const express = require('express');
const router = express.Router();
const axios = require('axios'); // Use axios for external API calls
const Delivery = require('../models/deliveryModel'); //
const authMiddleware = require('../middlewares/authMiddleware');//
const deliveryController = require('../controllers/deliveryController');

const MAP_API_URL = process.env.MAP_API_URL;
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Endpoint to retrieve nearby locations for pickup/delivery
router.get('/locations', async (req, res) => {
    const { latitude, longitude, radius = 5000 } = req.query;

    try {
        const response = await axios.get(MAP_API_URL, {
            params: {
                location: `${latitude},${longitude}`,
                radius:radius,
                key: API_KEY,
            },
        });

        const locations = response.data.results;
        res.status(200).json({ locations });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving locations', error: error.message });
    }
});

// Endpoint to schedule a delivery
router.post('/delivery', authMiddleware(), async (req, res) => {
    console.log('Delivery request received:', req.body);
    try {
        const delivery = await Delivery.create({
            userId: req.user.id, // assuming req.user contains authenticated user
            itemId: req.body.itemId,
            pickupLocation: req.body.pickupLocation,
            deliveryStatus: 'Pending', // Setting a default delivery status
        });

        res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Example: View delivery logs (only accessible by admin)
router.get('/logs', authMiddleware(['admin']), deliveryController.getAllDeliveries); // Use the appropriate method from deliveryController

module.exports = router;