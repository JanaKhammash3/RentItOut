const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log(rentalController);


router.post('/',authMiddleware(),rentalController.startRental);
router.get('/',  authMiddleware(), rentalController.getRentals); // Auth required

//router.put('/rentals/:rentalId', authMiddleware(['admin']), rentalController.updateRental);
router.put('/:rentalId',  rentalController.updateRental);

//router.delete('/rentals/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);
router.delete('/:rentalId',  rentalController.cancelRental);
module.exports = router;
