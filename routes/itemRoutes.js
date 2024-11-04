const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST: Add new item for rent
router.post('/', authMiddleware(), itemController.createItem);

// GET: Retrieve list of items
router.get('/', authMiddleware(), itemController.getAllItems);

// GET: Retrieve items for user
//with rentals
router.get('/myitems', authMiddleware(), itemController.getUserItems);

// GET: Retrieve items by category
router.get('/category/:category', authMiddleware(), itemController.getItemsByCategory);

// GET: Retrieve details of specific item
//with rentals
router.get('/:itemId',authMiddleware(), itemController.getItemById);

// GET: Retrieve all items for a specific user 
//with the rentals
router.get('/user/:ownerId', authMiddleware(['admin']), itemController.getItemsByUserId);


// PUT: Update an item
router.put('/:itemId', authMiddleware(), itemController.updateItem);

// DELETE: Delete an item
router.delete('/:itemId', authMiddleware(), itemController.deleteItem);

module.exports = router;
