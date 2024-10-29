//Handles CRUD operations for items.
const Item  = require('../models/itemModel'); // Adjust model path as needed
const { User } = require('../models/userModel'); // Import User model to validate ownerId

exports.createItem = async (req, res, next) => {
    try {
        console.log("User ID from token:", req.userId); // Log the extracted user ID

        const { name, category, description, pricePerDay, isAvailable } = req.body;

        // Validate the ownerId (now extracted from the token)
        const owner = await User.findByPk(req.userId);
        console.log("Owner retrieved from DB:", owner); // Log the owner retrieved from the database
        
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Add logging to check if the data is being passed correctly
        console.log("Creating item with data:", { name, category, description, pricePerDay, isAvailable });

        const item = await Item.create({
            name,
            category,
            description,
            pricePerDay,
            isAvailable,
            ownerId: req.userId, // Use the ID from the token
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
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating item:", error); // Log error details
        res.status(500).json({ error: error.message });
    }
};


// Get all items for a specific user (GET /items/user/:ownerId)
exports.getItemsByUserId = async (req, res, next) => {
    try {
        const { ownerId } = req.params; // Get ownerId from URL parameters

        // Fetch items based on ownerId
        const items = await Item.findAll({
            where: { ownerId: ownerId }, // Filter by ownerId
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
        const item = await Item.findByPk(req.params.itemId); // Use Sequelize's findByPk()
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
        const deletedRows = await Item.destroy({
            where: { id: req.params.itemId },
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};
