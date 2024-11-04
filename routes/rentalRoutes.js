const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/',authMiddleware(),rentalController.startRental);
router.get('/',  authMiddleware(), rentalController.getRentals); 

router.put('/:rentalId', authMiddleware(), rentalController.updateRental);
router.get('/myrentals', authMiddleware(), rentalController.getUserRentals);

router.delete('/:rentalId', authMiddleware(['admin']), rentalController.cancelRental);


router.patch('/:id/status', authMiddleware(), rentalController.updateRentalStatus);


router.post('/:id/receive',authMiddleware(), rentalController.markAsReceived);
router.delete('/myrental/:rentalId', authMiddleware(), rentalController.deleteUserRental);
module.exports = router;
