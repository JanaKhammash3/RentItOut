const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /items: Add a new item for rent
router.post('/', authMiddleware(), itemController.createItem);

// GET /items: Retrieve a list of items
router.get('/', authMiddleware(), itemController.getAllItems);

// GET /items/category/:category: Retrieve items by category
router.get('/category/:category', authMiddleware(), itemController.getItemsByCategory);

// GET /items/:itemId: Retrieve details of a specific item
//with rentals
router.get('/:itemId',authMiddleware(), itemController.getItemById);

// GET /items/user/:ownerId: Retrieve all items for a specific user 
//with the rentals
router.get('/user/:ownerId', authMiddleware(), itemController.getItemsByUserId);

// PUT /items/:itemId: Update an item
router.put('/:itemId', authMiddleware(), itemController.updateItem);

// DELETE /items/:itemId: Delete an item
router.delete('/:itemId', authMiddleware(), itemController.deleteItem);

module.exports = router;
