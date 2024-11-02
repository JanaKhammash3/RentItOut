const Delivery = require('../models/deliveryModel');
const Item = require('../models/itemModel'); // Check item availability
const Rental = require('../models/rentalModel');
// const sequelize = require('../config/database');

const axios = require('axios');

/*
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
*/

exports.createDelivery = async (req, res) => {
    const { rentalId} = req.body;

    try {
        // Validate item availability
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found ' });
        }

        if (rental.deliveryMethod !== 'delivery' || rental.status !== 'active') {
            return res.status(400).json({ message: 'Rental is not eligible for delivery' });
        }

        // Get itemId from rental and then find the item's location
        const item = await Item.findByPk(rental.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const { latitude, longitude } = item; // Assuming these fields exist in your items table

        // Use Google Maps Geocoding API to get the address from the latitude and longitude
        const geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY; // Use your actual API key
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${geocodingApiKey}`;

        const geocodingResponse = await axios.get(geocodingUrl);
        const address = geocodingResponse.data.results[0]?.formatted_address;

        if (!address) {
            return res.status(400).json({ message: 'Unable to get address from location' });
        }

        const delivery = await Delivery.create({
            userId: req.user.id,
            rentalId,
            pickupLocation: address,
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
