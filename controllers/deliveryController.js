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


// Retrieve all deliveries created by the logged-in user
exports.getUserDeliveries = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from authenticated request
        const userDeliveries = await Delivery.findAll({
            where: { userId },
            //include: [{ model: Rental }, { model: Item }], // Include associated data if needed
        });
        res.status(200).json(userDeliveries);
    } catch (error) {
        console.error('Error retrieving user deliveries:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Delete a delivery
exports.deleteDelivery = async (req, res) => {
    const { id } = req.params; // Get delivery ID from request parameters

    try {
        // Check if the delivery exists
        const delivery = await Delivery.findByPk(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Check if the delivery status is pending
        if (delivery.deliveryStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending deliveries can be deleted' });
        }

        // Check if the delivery belongs to the user
        if (delivery.userId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this delivery' });
        }

        // Delete the delivery
        await Delivery.destroy({ where: { id } });

        // Update the associated rental status back to active
        await Rental.update(
            { status: 'active' },
            { where: { id: delivery.rentalId } }
        );

        res.status(200).json({ message: 'Delivery deleted successfully' });
    } catch (error) {
        console.error('Error deleting delivery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};