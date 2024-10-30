const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /items: Add a new item for rent
// Protect item management routes as needed
router.post('/', authMiddleware(),  itemController.createItem); // Assuming addItem is for creating an item

// GET /items: Retrieve a list of items
router.get('/', itemController.getAllItems); // Assuming getItems fetches all items

// GET /items/category/:category: Retrieve items by category
router.get('/category/:category', itemController.getItemsByCategory); // New route for filtering items by category

// GET /items/:itemId: Retrieve details of a specific item
router.get('/:itemId', itemController.getItemById);

// GET /items/user/:ownerId: Retrieve all items for a specific user
router.get('/user/:ownerId', authMiddleware(['admin']), itemController.getItemsByUserId);


// PUT /items/:itemId: Update an item
router.put('/:itemId', itemController.updateItem);

// DELETE /items/:itemId: Delete an item
router.delete('/:itemId', itemController.deleteItem);

module.exports = router;
