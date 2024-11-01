// const {Rental} = require('../models/rentalModel');  // Sequelize Rental model
// const Item = require('../models/itemModel');  // Sequelize Item model
// const { User } = require('../models/userModel');  // Sequelize User model
const axios = require('axios'); // Add this line at the top of your file

const { Rental, Item, User } = require('../models/assosiations');

// POST /rentals: Start a new rental
exports.startRental = async (req, res, next) => {
    console.log('startRental function reached');
    try {
        let { itemId, startDate, endDate, deliveryMethod, deliveryLocation } = req.body;  // Only include itemId and rental dates
        const renterId = req.user?.id || 1;  // Extract renterId from the authenticated user

        // Fetch item to get pricing information
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the item is available
        if (!item.isAvailable) {
            return res.status(400).json({ message: 'Item is not available for rent' });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Calculate total rental cost (price per day)
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        let totalCost = rentalDays * item.pricePerDay;
        let locationResponse;

        if (deliveryMethod === 'delivery') {
            if (!deliveryLocation) {
                return res.status(400).json({ message: 'Delivery location required for delivery method' });
            }
            totalCost += 10; // Constant delivery cost
                 // Create the new rental in the database
              const newRental = await Rental.create({
                itemId,
                 renterId,  // Use authenticated user's ID
                      startDate,
                    endDate,
                      deliveryMethod,
                          deliveryLocation,
                          totalCost,
                            //  latitude,   // Add latitude to the rental
                            //  longitude ,
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

               // Check if delivery method is pickup-point
       else  if (deliveryMethod === 'pickup-point') {

            // Your logic to fetch locations
            const { latitude, longitude } = req.body;
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Coordinates required for pickup-point.' });
            }
            let locationResponse;

                    // Fetch nearby pickup locations
                 locationResponse = await axios.get(`http://localhost:5000/api/deliveries/locations`, {
                   params: { latitude, longitude }
                });

                if (!locationResponse.data.locations || locationResponse.data.locations.length === 0) {
                    return res.status(404).json({ message: 'No nearby pickup locations found.' });
                }
                deliveryLocation = locationResponse.data.locations[0].address || locationResponse.data.locations[0].name;
                if (typeof deliveryLocation !== 'string') {
                    return res.status(500).json({ message: 'Invalid format for delivery location.' });
                }
            





                // return res.status(200).json({
                //     message: 'Nearby locations for pickup-point and rental created successfully',
                //     locations: locationResponse && locationResponse.data ? locationResponse.data.locations : [],  // Only include locations if available
                //     // rental: newRental
                // });
               

            // At this point, we have valid locations. You can choose the first location or implement your own logic.
           
          // Extract a string representation of the location (e.g., address)
            //  deliveryLocation = locationResponse.data.locations[0].address || locationResponse.data.locations[0].name;
            //  console.log('Selected delivery location:', deliveryLocation);

            // if (typeof deliveryLocation !== 'string') {
            //   return res.status(500).json({ message: 'Invalid format for delivery location.' });
            //          }
                    
                    

    

        // Create the new rental in the database
        const newRental = await Rental.create({
            itemId,
            renterId,  // Use authenticated user's ID
            startDate,
            endDate,
            deliveryMethod,
            deliveryLocation,
            totalCost,
            latitude,   // Add latitude to the rental
            longitude ,
        });
            item.isAvailable = false;
             await item.save();
            return res.status(201).json({
            rental: newRental,// Include rental details in the response
            message: 'Nearby locations for pickup-point and rental created successfully',
            locations: locationResponse.data.locations,
            
            });
       }
        
    //     // Mark the item as unavailable after the rental is started
    //    item.isAvailable = false;
    //     await item.save();
    //     await newRental.save();

    //     res.status(201).json({
    //         success: true,
    //         message: 'Rental started successfully',
    //         rental: newRental,
    //     });
                           
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        next(error);
    }
};

// GET /rentals: View all rentals
exports.getRentals = async (req, res, next) => {
    console.log('getRentals function reached');
    try {
        const rentals = await Rental.findAll({
            include: [
                { model: Item },  // Include associated Item details
                { model: User, as: 'renter' }  // Include associated renter details
            ],
        });
        res.status(200).json(rentals);
    } catch (error) {
        console.error('Error in getRentals:', error);
        res.status(500).json({ error: error.message });
    }
};
// PUT /rentals/:rentalId: Update rental period and recalculate cost
exports.updateRental = async (req, res, next) => {
    console.log('updateRental function reached'); 
    try {
        const { startDate, endDate } = req.body;
        const rental = await Rental.findByPk(req.params.rentalId);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Recalculate total cost
        const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const item = await Item.findByPk(rental.itemId);
        const totalCost = rentalDays * item.pricePerDay;

        // Update rental details
        rental.startDate = startDate;
        rental.endDate = endDate;
        rental.totalCost = totalCost;
        await rental.save();

        res.status(200).json(rental);
    } catch (error) {
        next(error);
    }
};

// DELETE /rentals/:rentalId: Cancel a rental
// exports.cancelRental = async (req, res, next) => {
//     console.log('cancelRental function reached');  // Log to confirm function execution
//     try {
//         const rental = await Rental.findByPk(req.params.rentalId);
//         if (!rental) {
//             return res.status(404).json({ message: 'Rental not found' });
//         }

//         // Delete the rental record from the database
//         await rental.destroy();

//         res.status(200).json({
//             success: true,
//             message: 'Rental deleted successfully'
//         });
//     } catch (error) {
//         console.error('Error in cancelRental:', error);  // Log any errors
//         next(error);
//     }
// };
exports.cancelRental = async (req, res, next) => {
    console.log('cancelRental function reached');
    try {
        // Find the rental by ID
        const rental = await Rental.findByPk(req.params.rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Find the associated item using itemId from the rental
        const item = await Item.findByPk(rental.itemId);
        if (item) {
            // Set the item availability to true
            item.isAvailable = true;
            await item.save(); // Save the updated item
        }

        // Delete the rental record from the database
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

