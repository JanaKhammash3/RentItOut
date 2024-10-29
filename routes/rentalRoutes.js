const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log(rentalController);


router.post('/',authMiddleware(),rentalController.startRental);
router.get('/',  authMiddleware(), rentalController.getRentals); // Auth required

router.put('/:rentalId', authMiddleware(['admin']), rentalController.updateRental);


router.delete('/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);

module.exports = router;
