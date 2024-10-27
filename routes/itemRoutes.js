const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /items: Add a new item for rent
// Protect item management routes as needed
router.post('/', authMiddleware(),  itemController.createItem); // Assuming addItem is for creating an item

// GET /items: Retrieve a list of items
router.get('/', itemController.getAllItems); // Assuming getItems fetches all items

// GET /items/:itemId: Retrieve details of a specific item
router.get('/:itemId', itemController.getItemById);

// PUT /items/:itemId: Update an item
router.put('/:itemId', itemController.updateItem);

// DELETE /items/:itemId: Delete an item
router.delete('/:itemId', itemController.deleteItem);

module.exports = router;
