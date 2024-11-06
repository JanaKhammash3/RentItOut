const axios = require('axios'); 
const Delivery = require('../models/deliveryModel');  

const { Rental, Item, User, Insurance } = require('../models/assosiations');


exports.startRental = async (req, res, next) => {
    console.log('startRental function reached');
    try {
        let { itemId, startDate, endDate, deliveryMethod } = req.body;  
        const renterId = req.user?.id || 1; 

        
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        
        if (!item.isAvailable) {
            return res.status(400).json({ message: 'Item is not available for rent' });
        }

        
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        let totalCost = rentalDays * item.pricePerDay;
        

        if (deliveryMethod === 'delivery') {
          
            const { latitude, longitude } = req.body;
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Coordinates required for delivery location.' });
            }

            totalCost += 10; 
                 
            const newRental = await Rental.create({
                itemId,
                renterId,  
                startDate,
                endDate,
                deliveryMethod,
                totalCost,
                 latitude,  
                 longitude ,
            });
            
            item.isAvailable = false;
            await item.save();
            await newRental.save();

            res.status(201).json({
                success: true,
                message: 'Rental started successfully',
                rental: newRental,
            });
        }
         
        
       else if (deliveryMethod === 'pickup-point') {

           
            const { latitude, longitude } = req.body;
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Coordinates required for pickup-point.' });
            }
            let locationResponse;
            
            
            locationResponse = await axios.get(`http://localhost:5000/api/deliveries/locations`, {
                params: { latitude, longitude }
            });

            if (!locationResponse.data.locations || locationResponse.data.locations.length === 0) {
                return res.status(404).json({ message: 'No nearby pickup locations found.' });
            }
            


        const newRental = await Rental.create({
            itemId,
            renterId,  
            startDate,
            endDate,
            deliveryMethod,
            totalCost,
            latitude,   
            longitude ,
        });
            item.isAvailable = false;
             await item.save();
            return res.status(201).json({
            rental: newRental,
            message: 'Nearby locations for pickup-point and rental created successfully',
            locations: locationResponse.data.locations,
            
            });
       }
       
       else if (deliveryMethod === 'in-person') {
          
            if (!item.latitude || !item.longitude) {
                return res.status(400).json({ message: 'Item location coordinates are missing.' });
            }
        
        
            const newRental = await Rental.create({
                itemId,
                renterId,
                startDate,
                endDate,
                deliveryMethod,
                totalCost,
            });
        
           
            item.isAvailable = false;
            await item.save();
        
           
            const googleMapsLink = `https://www.google.com/maps/?q=${item.latitude},${item.longitude}`;
        
          
            const geocodingApiKey = process.env.GOOGLE_MAPS_API_KEY; 
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${item.latitude},${item.longitude}&key=${geocodingApiKey}`;
        
            try {
                const response = await axios.get(geocodeUrl);
                const address = response.data.results[0] ? response.data.results[0].formatted_address : 'Address not found';
        
                
                return res.status(201).json({
                    success: true,
                    message: 'Rental started successfully',
                    rental: {
                        status: "active",
                        id: newRental.id, 
                        itemId: itemId,
                        renterId: renterId,
                        startDate: startDate,
                        endDate: endDate,
                        deliveryMethod: deliveryMethod,
                        totalCost: newRental.totalCost,
                        updatedAt: newRental.updatedAt, 
                        createdAt: newRental.createdAt, 
                        'item location': googleMapsLink, 
                        address: address 
                    }
                });
            } catch (error) {
                console.error('Error fetching address from Geocoding API:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching location details',
                    error: error.message
                });
            }
        }
                
        else {
       
        return res.status(400).json({ message: 'Invalid delivery method' });
        }
        
        
       item.isAvailable = false;
        await item.save();
        await newRental.save();

        res.status(201).json({
            success: true,
            message: 'Rental started successfully',
            rental: newRental,
        });
                           
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        next(error);
    }
};


const updateRentalStatusAndAvailability = async () => {
    try {
        const currentDate = new Date();

        const expiredRentals = await Rental.findAll({
            where: {
                endDate: {
                    [Op.lt]: currentDate
                }
            },
            include: [Item]
        });

        for (const rental of expiredRentals) {
            const item = rental.Item;

            if (item) {
                item.isAvailable = true;
                await item.save();
            }
        }

        console.log(`Updated availability for ${expiredRentals.length} items.`);
    } catch (error) {
        console.error('Error updating rental statuses:', error);
    }
};



exports.getRentals = async (req, res, next) => {
    console.log('getRentals function reached');
    try {
        const rentals = await Rental.findAll({
            include: [
                { model: Item },  
                { model: User, as: 'renter' } 
            ],
        });
        res.status(200).json(rentals);
    } catch (error) {
        console.error('Error in getRentals:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateRental = async (req, res, next) => {
    console.log('updateUserRental function reached');
    try {
        const userId = req.user.id; // Get user ID from token middleware
        const rentalId = req.params.rentalId; // Rental ID from route parameter
        const { startDate, endDate, deliveryMethod } = req.body;

        // Find the rental by its ID and ensure it belongs to the user
        const rental = await Rental.findOne({
            where: {
                id: rentalId,
                renterId: userId
            }
        });

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found or does not belong to the user' });
        }

        // If dates are provided, validate and recalculate the total cost
        if (startDate && endDate) {
            const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            if (rentalDays <= 0) {
                return res.status(400).json({ message: 'End date must be after start date' });
            }

            const item = await Item.findByPk(rental.itemId);
            const totalCost = rentalDays * item.pricePerDay;

            rental.startDate = startDate;
            rental.endDate = endDate;
            rental.totalCost = totalCost;
        }

        // Update delivery method if provided
        if (deliveryMethod) {
            if (!['delivery', 'pickup-point', 'in-person'].includes(deliveryMethod)) {
                return res.status(400).json({ message: 'Invalid delivery method' });
            }
            rental.deliveryMethod = deliveryMethod;
        }

        // Save the updated rental
        await rental.save();

        res.status(200).json({
            success: true,
            message: 'Rental updated successfully',
            rental
        });
    } catch (error) {
        console.error('Error updating user rental:', error);
        res.status(500).json({ success: false, message: 'Failed to update rental', error: error.message });
    }
};


exports.cancelRental = async (req, res, next) => {
    console.log('cancelRental function reached');
    try {
        
        const rental = await Rental.findByPk(req.params.rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        
        const item = await Item.findByPk(rental.itemId);
        if (item) {
            
            item.isAvailable = true;
            await item.save(); 
        }

       
        await rental.destroy();

        res.status(200).json({
            success: true,
            message: 'Rental deleted successfully, item is now available',
        });
    } catch (error) {
        console.error('Error in cancelRental:', error);
        next(error);
    }
};


exports.getUserRentals = async (req, res) => {
    try {
        const userId = req.user.id;

        
        const userRentals = await Rental.findAll({
            where: { renterId: userId },
            include: [
                {
                    model: Insurance,
                    as: 'insurance', 
                    required: false, 
                },
                {
                    model: Item,
                    attributes: ['name', 'description', 'pricePerDay']
                }
            ],
        });

        if (!userRentals || userRentals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No rentals found for this user',
            });
        }

        res.status(200).json({
            success: true,
            rentals: userRentals.map(rental => ({
                ...rental.toJSON(),
                insurance: rental.insurance || null, 
            })),
        });
    } catch (error) {
        console.error('Error fetching user rentals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user rentals',
            error: error.message,
        });
    }
};

exports.updateRentalStatus = async (req, res) => {
    const { id } = req.params; 
    const userId = req.user.id; 

    try {
        
        const rental = await Rental.findByPk(id);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

       
        if (rental.renterId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this rental' });
        }

        if (rental.status !== 'in-transit') {
            return res.status(400).json({ message: 'Rental must be in-transit to mark as received' });
        }

        
        rental.status = 'received';
        await rental.save();

        
        const delivery = await Delivery.findOne({ where: { rentalId: id } });
        if (delivery) {
            delivery.deliveryStatus = 'Completed';
            await delivery.save();
        }

        res.status(200).json({ message: 'Rental status updated to received successfully, and delivery status updated' });
    } catch (error) {
        console.error('Error updating rental status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.markAsReceived = async (req, res) => {
    try {
        const rentalId = req.params.id;
        const userId = req.user.id; 

        
        const rental = await Rental.findByPk(rentalId);
        
        if (!rental) {
            return res.status(404).json({ error: "Rental not found." });
        }
        
       
        if (rental.renterId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this rental' });
        }

        
        if (rental.status !== 'active') {
            return res.status(400).json({ error: "Rental is not active and cannot be marked as received." });
        }
        
        if (rental.deliveryMethod !== 'pickup-point' && rental.deliveryMethod !== 'in-person') {
            return res.status(400).json({ error: "Rental can only be marked as received if the delivery method is 'pickup-point' or 'in-person'." });
        }
        
        
        rental.status = 'received';
        await rental.save();
        
        res.status(200).json({ message: "Rental status updated to received.", rental });
    } catch (error) {
        res.status(500).json({ error: "Failed to update rental status." });
    }
};
exports.deleteUserRental = async (req, res) => {
    try {
        const userId = req.user.id;  
        const rentalId = req.params.rentalId;  

        const rental = await Rental.findOne({
            where: {
                id: rentalId,
                renterId: userId
            }
        });

        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Rental not found or does not belong to the user'
            });
        }

        
        await Delivery.destroy({ where: { rentalId } });

        
        const item = await Item.findByPk(rental.itemId);
        if (item) {
            item.isAvailable = true;
            await item.save();
        }

        await rental.destroy();

        res.status(200).json({
            success: true,
            message: 'Rental deleted successfully and item is now available',
        });
    } catch (error) {
        console.error('Error deleting user rental:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete rental',
            error: error.message
        });
    }
};