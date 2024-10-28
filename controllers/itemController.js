//Handles CRUD operations for items.
const Item  = require('../models/itemModel'); // Adjust model path as needed
const { User } = require('../models/userModel'); // Import User model to validate ownerId

// Create a new item (POST /items)
exports.createItem = async (req, res, next) => {
    try {
        const { name, category, description, pricePerDay, isAvailable, ownerId } = req.body;

        // Validate the ownerId
        const owner = await User.findByPk(ownerId);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Add logging to check if the data is being passed correctly
        console.log("Creating item with data:", { name, category, description, pricePerDay, isAvailable, ownerId });

        const item = await Item.create({
            name,
            category,
            description,
            pricePerDay,
            isAvailable,
            ownerId,
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

// Get all items (GET /items)
exports.getAllItems = async (req, res, next) => {
    try {
        const items = await Item.findAll(); // Use Sequelize's findAll()
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
        const [updatedRows, [updatedItem]] = await Item.update(req.body, {
            where: { id: req.params.itemId },
            returning: true, // Needed to get the updated item
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
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
