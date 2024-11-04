const express = require('express');
const insuranceController = require('../controllers/insuranceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/add', authMiddleware(['admin']), insuranceController.addInsurance);


router.get('/:rentalId', authMiddleware(), insuranceController.getInsurance);

module.exports = router;
