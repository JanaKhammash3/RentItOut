const Delivery = require('../models/deliveryModel');
const Item = require('../models/itemModel'); // Check item availability
const Rental = require('../models/rentalModel');
// const sequelize = require('../config/database');

const axios = require('axios');

// Create a new delivery with validations
exports.createDelivery = async (req, res) => {
    const { rentalId } = req.body;

    try {
        // Validate item availability
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Check if renterId is the same as userId
        if (rental.renterId === req.user.id) {
            return res.status(400).json({ message: 'Invalid: Renter cannot create delivery for their own rental' });
        }

        if (rental.deliveryMethod !== 'delivery' || rental.status !== 'active') {
            return res.status(400).json({ message: 'Rental is not eligible for delivery' });
        }

        // Get itemId from rental and then find the item's location for pickupLocation
        const item = await Item.findByPk(rental.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Get the latitude and longitude for pickupLocation from items table
        const { latitude: itemLatitude, longitude: itemLongitude } = item; 

        // Get the latitude and longitude for deliveryLocation from rentals table
        const { latitude: rentalLatitude, longitude: rentalLongitude } = rental;

        // Use Google Maps Geocoding API to get the pickupLocation address
        const geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY; // Use your actual API key
        const pickupGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${itemLatitude},${itemLongitude}&key=${geocodingApiKey}`;
        const pickupGeocodingResponse = await axios.get(pickupGeocodingUrl);
        const pickupLocation = pickupGeocodingResponse.data.results[0]?.formatted_address;

        if (!pickupLocation) {
            return res.status(400).json({ message: 'Unable to get pickup location address from item location' });
        }

        // Use Google Maps Geocoding API to get the deliveryLocation address
        const deliveryGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${rentalLatitude},${rentalLongitude}&key=${geocodingApiKey}`;
        const deliveryGeocodingResponse = await axios.get(deliveryGeocodingUrl);
        const deliveryLocation = deliveryGeocodingResponse.data.results[0]?.formatted_address;

        if (!deliveryLocation) {
            return res.status(400).json({ message: 'Unable to get delivery location address from rental location' });
        }

        // Create the delivery with both pickupLocation and deliveryLocation
        const delivery = await Delivery.create({
            userId: req.user.id, 
            rentalId,
            pickupLocation,
            deliveryLocation,
        });

        // Update rental status to 'in-delivery'
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
