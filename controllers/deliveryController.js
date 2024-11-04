const Delivery = require('../models/deliveryModel');
const Item = require('../models/itemModel'); 
const Rental = require('../models/rentalModel');
const axios = require('axios');

// create new delivery (+validations)
exports.createDelivery = async (req, res) => {
    const { rentalId } = req.body;

    try {
        // item availability
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // checking if renter id same as user id
        if (rental.renterId === req.user.id) {
            return res.status(400).json({ message: 'Invalid: Renter cannot create delivery for their own rental' });
        }

        // check if the method of delivery is delivery and rental is active 
        if (rental.deliveryMethod !== 'delivery' || rental.status !== 'active') {
            return res.status(400).json({ message: 'Rental is not eligible for delivery' });
        }

        // get item by id to get item location for delivery pickup location
        const item = await Item.findByPk(rental.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // latitude and longitude for delivery pickup location from items table
        const { latitude: itemLatitude, longitude: itemLongitude } = item; 

        // latitude and longitude for deliveryLocation from rentals table
        const { latitude: rentalLatitude, longitude: rentalLongitude } = rental;

        // external API 
        // google maps geocoding API (generate pickupLocation)
        const geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const pickupGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${itemLatitude},${itemLongitude}&key=${geocodingApiKey}`;
        const pickupGeocodingResponse = await axios.get(pickupGeocodingUrl);
        const pickupLocation = pickupGeocodingResponse.data.results[0]?.formatted_address;

        if (!pickupLocation) {
            return res.status(400).json({ message: 'Unable to get pickup location address from item location' });
        }

        // google maps geocoding API (generate deliveryLocation) 
        const deliveryGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${rentalLatitude},${rentalLongitude}&key=${geocodingApiKey}`;
        const deliveryGeocodingResponse = await axios.get(deliveryGeocodingUrl);
        const deliveryLocation = deliveryGeocodingResponse.data.results[0]?.formatted_address;

        if (!deliveryLocation) {
            return res.status(400).json({ message: 'Unable to get delivery location address from rental location' });
        }

        // scheduled delivery
        const delivery = await Delivery.create({
            userId: req.user.id, 
            rentalId,
            pickupLocation,
            deliveryLocation,
        });

        // change rental status to 'in-delivery'
        await Rental.update(
            { status: 'in-delivery' }, 
            { where: { id: rentalId } }
        );

        console.log('Created Delivery:', delivery);
        res.status(201).json({ message: 'Delivery scheduled successfully', delivery });
    } catch (error) {
        console.error('Error creating delivery:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// get all deliveries
exports.getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll();
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// all deliveries by the user logged in 
exports.getUserDeliveries = async (req, res) => {
    try {
        const userId = req.user.id; 
        const userDeliveries = await Delivery.findAll({
            where: { userId },
        });
        res.status(200).json(userDeliveries);
    } catch (error) {
        console.error('Error retrieving user deliveries:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// delete a delivery
exports.deleteDelivery = async (req, res) => {
    const { id } = req.params; 

    try {
        const delivery = await Delivery.findByPk(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // if the delivery status --> pending
        if (delivery.deliveryStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending deliveries can be deleted' });
        }

        // if the delivery is for user
        if (delivery.userId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this delivery' });
        }

        await Delivery.destroy({ where: { id } });

        // change the rental status again to active
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

// change delivery status to 'in-transit'
exports.updateDeliveryStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const delivery = await Delivery.findByPk(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // if the delivery is for user
        if (delivery.userId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to update this delivery' });
        }

        if (delivery.deliveryStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending deliveries can be updated to in-transit' });
        }

        // change delivery status to 'in-transit'
        await Delivery.update(
            { deliveryStatus: 'In Transit' },
            { where: { id } }
        );

        // change rental status to 'in-transit'
        await Rental.update(
            { status: 'in-transit' }, 
            { where: { id: delivery.rentalId } } 
        );

        res.status(200).json({ message: 'Delivery status updated to in-transit successfully and rental status updated' });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
