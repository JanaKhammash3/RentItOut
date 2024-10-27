const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /rentals: Start a new rental
//Auth required for all users
router.post('/rentals', authMiddleware(), rentalController.startRental); // Auth required

// GET /rentals: View all rentals
//Auth required for all users
router.get('/rentals', authMiddleware(), rentalController.getRentals); // Auth required

// PUT /rentals/:rentalId: Update a rental period
// Update a rental period - Only accessible by admin
router.put('/rentals/:rentalId', authMiddleware(['admin']), rentalController.updateRental);

// DELETE /rentals/:rentalId: Cancel a rental
// Cancel a rental - Only accessible by admin
router.delete('/rentals/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);

module.exports = router;
