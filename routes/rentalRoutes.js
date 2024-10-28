const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log(rentalController);


router.post('/',authMiddleware(),rentalController.startRental);
router.get('/',  rentalController.getRentals); // Auth required

// PUT /rentals/:rentalId: Update a rental period
// Update a rental period - Only accessible by admin
//router.put('/rentals/:rentalId', authMiddleware(['admin']), rentalController.updateRental);
router.put('/:rentalId',  rentalController.updateRental);
// DELETE /rentals/:rentalId: Cancel a rental
// Cancel a rental - Only accessible by admin
//router.delete('/rentals/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);
router.delete('/:rentalId',  rentalController.cancelRental);
module.exports = router;
