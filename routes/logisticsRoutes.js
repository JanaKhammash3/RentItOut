const express = require('express');
const router = express.Router();
const Delivery = require('../models/deliveryModel'); 
const authMiddleware = require('../middlewares/authMiddleware');
const deliveryController = require('../controllers/deliveryController');

// Endpoint to schedule a delivery
router.post('/deliveries', authMiddleware(), async (req, res) => {
    try {
        const delivery = await Delivery.create({
            userId: req.user.id, // assuming req.user contains authenticated user
            itemId: req.body.itemId,
            pickupLocation: req.body.pickupLocation
        });

        res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Example: View delivery logs (only accessible by admin)
router.get('/logs', authMiddleware(['admin']), deliveryController.getAllDeliveries); // Use the appropriate method from deliveryController

module.exports = router;