const express = require('express');
const router = express.Router();
const axios = require('axios'); // Use axios for external API calls
const Delivery = require('../models/deliveryModel'); //
const authMiddleware = require('../middlewares/authMiddleware');//
const deliveryController = require('../controllers/deliveryController');

// router.use('/deliveries', logisticsRoutes);

const MAP_API_URL = process.env.MAP_API_URL;
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

//  relevant place types or keywords
const PLACE_TYPES = [
    'hardware_store',
    'electronics_store',
    'furniture_store',
    'car_rental',
    'gym',
    'party_store'
];

const PLACE_KEYWORDS = [
    'tool rentals',
    'party equipment',
    'sports gear'
];

router.get('/:rentalId/delivery-options', authMiddleware(), async (req, res) => {
    try {
        const deliveryOptions = ['delivery', 'pickup-point', 'in-person'];
        res.status(200).json({ deliveryOptions });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving delivery options', error: error.message });
    }
});


// Endpoint to retrieve nearby locations for pickup/delivery
router.get('/locations', async (req, res) => {
    const { latitude, longitude, radius = 5000 } = req.query;

    try {
        const placeRequests = PLACE_TYPES.map(type =>
            axios.get(MAP_API_URL, {
                params: {
                    location: `${latitude},${longitude}`,
                    radius,
                    type,
                    key: API_KEY,
                },
            })
        );

        const keywordRequests = PLACE_KEYWORDS.map(keyword =>
            axios.get(MAP_API_URL, {
                params: {
                    location: `${latitude},${longitude}`,
                    radius,
                    keyword,
                    key: API_KEY,
                },
            })
        );

        // Execute all requests concurrently
        const responses = await Promise.all([...placeRequests, ...keywordRequests]);

        // Combine, filter, and remove duplicate locations
        const locations = responses
            .flatMap(response => response.data.results)
            .filter(location =>
                PLACE_TYPES.some(type => location.types.includes(type)) ||
                PLACE_KEYWORDS.some(keyword =>
                    location.name.toLowerCase().includes(keyword.toLowerCase())
                )
            );

        // Remove duplicates based on place_id
        const uniqueLocations = Array.from(
            new Map(locations.map(loc => [loc.place_id, loc])).values()
        );

        res.status(200).json({ locations: uniqueLocations });
    } catch (error) {
        console.error('Error retrieving locations:', error);
        res.status(500).json({ message: 'Error retrieving locations', error: error.message });
    }
});


// Endpoint to schedule a delivery
// router.post('/delivery', authMiddleware(), async (req, res) => {
//     console.log('Delivery request received:', req.body);
//     try {
//         const delivery = await Delivery.create({
//             userId: req.user.id, // assuming req.user contains authenticated user
//             rentalId: req.body.rentalId,
//             pickupLocation: req.body.pickupLocation,
//             deliveryStatus: 'Pending', // Setting a default delivery status
//         });

//         res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

router.post('/delivery', authMiddleware(), deliveryController.createDelivery); // Use the controller method for delivery creation


// Example: View delivery logs (only accessible by admin)
router.get('/logs', authMiddleware(['admin']), deliveryController.getAllDeliveries); // Use the appropriate method from deliveryController

router.get('/my-deliveries', authMiddleware(), deliveryController.getUserDeliveries);

// Route to delete a delivery
router.delete('/:id', authMiddleware(), deliveryController.deleteDelivery);

// Update delivery status route
router.patch('/:id/status', authMiddleware(), deliveryController.updateDeliveryStatus);

module.exports = router;