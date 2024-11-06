const express = require('express');
const router = express.Router();
const axios = require('axios');
const Delivery = require('../models/deliveryModel'); //
const authMiddleware = require('../middlewares/authMiddleware');//
const deliveryController = require('../controllers/deliveryController');

const MAP_API_URL = process.env.MAP_API_URL;
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// place types or keywords
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

// get nearby locations (google map)
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

        const responses = await Promise.all([...placeRequests, ...keywordRequests]);

        // filter locations
        const locations = responses
            .flatMap(response => response.data.results)
            .filter(location =>
                PLACE_TYPES.some(type => location.types.includes(type)) ||
                PLACE_KEYWORDS.some(keyword =>
                    location.name.toLowerCase().includes(keyword.toLowerCase())
                )
            );

        const uniqueLocations = Array.from(
            new Map(locations.map(loc => [loc.place_id, loc])).values()
        );

        res.status(200).json({ locations: uniqueLocations });
    } catch (error) {
        console.error('Error retrieving locations:', error);
        res.status(500).json({ message: 'Error retrieving locations', error: error.message });
    }
});

router.post('/delivery', authMiddleware(), deliveryController.createDelivery); 

router.get('/logs', authMiddleware(['admin']), deliveryController.getAllDeliveries);

router.get('/my-deliveries', authMiddleware(), deliveryController.getUserDeliveries);

router.delete('/:id', authMiddleware(), deliveryController.deleteDelivery);

router.patch('/:id/status', authMiddleware(), deliveryController.updateDeliveryStatus);

module.exports = router;