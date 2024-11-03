const express = require('express');
const insuranceController = require('../controllers/insuranceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to add insurance (Admin only)
router.post('/add', authMiddleware(['admin']), insuranceController.addInsurance);

// Route to get insurance for a rental
router.get('/:rentalId', authMiddleware(), insuranceController.getInsurance);

module.exports = router;
