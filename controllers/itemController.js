//Handles CRUD operations for items.
const Item = require('../models/itemModel'); // Adjust model path as needed

// Create a new item (POST /items)
exports.createItem = async (req, res, next) => {
    try {
        const item = await Item.create(req.body); // Using Sequelize's create method
        res.status(201).json(item);
    } catch (error) {
        next(error); // Pass error to global error handler if defined
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

        if (!updatedRows) {
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

        if (!deletedRows) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        next(error);
    }
};

