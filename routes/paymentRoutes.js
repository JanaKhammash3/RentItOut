const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateRequest'); // Middleware for request validation

// POST /payments: Handle rental payments and deposits
router.post('/payments', authMiddleware(), validateRequest, paymentController.processPayment);

// Example admin route: Get all payments
router.get('/', authMiddleware(['admin']), paymentController.getAllPayments); // Auth required for admin

module.exports = router;