const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');




router.post('/',authMiddleware(),rentalController.startRental);
router.get('/',  authMiddleware(), rentalController.getRentals); // Auth required

router.put('/:rentalId', authMiddleware(['admin']), rentalController.updateRental);
router.get('/myrentals', authMiddleware(), rentalController.getUserRentals);

router.delete('/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);

module.exports = router;
