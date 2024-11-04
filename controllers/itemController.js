
const { Rental, Item, User } = require('../models/assosiations');

exports.createItem = async (req, res, next) => {
    try {
        const { name, category, description, pricePerDay, isAvailable, latitude, longitude } = req.body;

        // Validate the ownerId (now extracted from the token)
        const owner = await User.findByPk(req.userId);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        const item = await Item.create({
            name,
            category,
            description,
            pricePerDay,
            isAvailable,
            ownerId: req.userId, // Use the ID from the token
            latitude,
            longitude,
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: {
                id: item.id,
                name: item.name,
                category: item.category,
                description: item.description,
                pricePerDay: item.pricePerDay,
                isAvailable: item.isAvailable,
                ownerId: item.ownerId,
                latitude: item.latitude,
                longitude: item.longitude,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating item:", error); // Log error details
        res.status(500).json({ error: error.message });
    }
};

// GET /items/user: Get all items for the authenticated user without pagination
exports.getUserItems = async (req, res, next) => {
    try {
        const userId = req.userId;  // Assumes userId is set by authentication middleware

        // Fetch all items for the authenticated user
        const items = await Item.findAll({
            where: { ownerId: userId },
            include: {
                model: Rental,
                as: 'rentals', // Specify alias as used in the association
                attributes: ['id', 'startDate', 'endDate', 'totalCost', 'renterId'],
            },
            order: [['createdAt', 'DESC']], // Optional sorting, adjust as needed
        });

        // If no items are found, return a 404 response
        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this user.' });
        }

        res.status(200).json({
            success: true,
            items,
        });
    } catch (error) {
        console.error("Error retrieving items for user:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user items',
            error: error.message,
        });
    }
};




// Get all items for a specific user (GET /items/user/:ownerId)
exports.getItemsByUserId = async (req, res, next) => {
    try {
        const { ownerId } = req.params; // Get ownerId from URL parameters

        // Fetch items based on ownerId and include their rental status
        const items = await Item.findAll({
            where: { ownerId: ownerId }, // Filter by ownerId
            include: {
                model: Rental,
                attributes: ['id', 'startDate', 'endDate', 'totalCost', 'renterId'],
            },
        });

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this user.' });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error("Error retrieving items for user:", error); // Log error details
        next(error);
    }
};

// Get all items (GET /items)
exports.getAllItems = async (req, res, next) => {
    try {
        const items = await Item.findAll(); // Use Sequelize's findAll()
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// Get items by category (GET /items/category/:category)
exports.getItemsByCategory = async (req, res, next) => {
    const { category } = req.params; // Get category from the URL params

    try {
        const items = await Item.findAll({
            where: { category } // Filter by category
        });

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this category' });
        }

        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// Get a specific item by ID (GET /items/:itemId)
exports.getItemById = async (req, res, next) => {
    try {
        const item = await Item.findByPk(req.params.itemId, {
            include: {
                model: Rental,
                attributes: ['id', 'startDate', 'endDate', 'totalCost', 'renterId'],
            },
        }); // Use Sequelize's findByPk() and include rental details
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

// Update an item (PUT /items/:itemId)
exports.updateItem = async (req, res, next) => {
    try {
        const [updatedRows, updatedItems] = await Item.update(req.body, {
            where: { id: req.params.itemId },
            returning: true, // Needed to get the updated item
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const updatedItem = updatedItems[0]; // Get the first updated item
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

// Delete an item (DELETE /items/:itemId)
exports.deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findByPk(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.ownerId !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this item' });
        }

        // Optionally delete related deliveries if applicable
        await Delivery.destroy({
            where: { rentalId: item.rentalId } // Adjust this based on your relationships
        });

        const deletedRows = await Item.destroy({
            where: { id: req.params.itemId },
        });

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};
