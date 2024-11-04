const { Rental, Item, User } = require('../models/assosiations');

exports.createItem = async (req, res, next) => {
    try {
        const { name, category, description, pricePerDay, isAvailable, latitude, longitude } = req.body;

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
            ownerId: req.userId, 
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
        console.error("Error creating item:", error); 
        res.status(500).json({ error: error.message });
    }
};

// GET: Get all items for the user
exports.getUserItems = async (req, res, next) => {
    try {
        const userId = req.userId;  

        const items = await Item.findAll({
            where: { ownerId: userId },
            include: {
                model: Rental,
                as: 'rentals', 
                attributes: ['id', 'startDate', 'endDate', 'totalCost', 'renterId'],
            },
            order: [['createdAt', 'DESC']], 
        });

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

// Get all items for a specific user 
exports.getItemsByUserId = async (req, res, next) => {
    try {
        const { ownerId } = req.params; 

        const items = await Item.findAll({
            where: { ownerId: ownerId }, 
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
        console.error("Error retrieving items for user:", error); 
        next(error);
    }
};

// Get all items 
exports.getAllItems = async (req, res, next) => {
    try {
        const items = await Item.findAll(); 
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// Get items by category 
exports.getItemsByCategory = async (req, res, next) => {
    const { category } = req.params; 

    try {
        const items = await Item.findAll({
            where: { category } 
        });

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this category' });
        }

        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// Get a specific item by id
exports.getItemById = async (req, res, next) => {
    try {
        const item = await Item.findByPk(req.params.itemId, {
            include: {
                model: Rental,
                attributes: ['id', 'startDate', 'endDate', 'totalCost', 'renterId'],
            },
        }); 
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

// PUT: Update an item (authenticated user's item only)
exports.updateItem = async (req, res, next) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.userId;  // Assumes userId is set by authentication middleware

        // Find the item by ID to check ownership
        const item = await Item.findByPk(itemId);

        // Check if the item exists
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the authenticated user is the owner of the item
        if (item.ownerId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this item' });
        }

        // Update the item fields with the provided data
        const [updatedRows, updatedItems] = await Item.update(req.body, {
            where: { id: itemId },
            returning: true,  // Needed to get the updated item in response
        });

        // Verify if the update was successful
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const updatedItem = updatedItems[0];  // Get the first updated item
        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            item: updatedItem,
        });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
            error: error.message,
        });
    }
};


// Delete an item 
exports.deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findByPk(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.ownerId !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this item' });
        }

        await Delivery.destroy({
            where: { rentalId: item.rentalId } 
        });

        const deletedRows = await Item.destroy({
            where: { id: req.params.itemId },
        });

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};
