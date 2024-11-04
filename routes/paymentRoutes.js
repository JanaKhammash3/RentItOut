const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateRequest'); // Middleware for request validation


// POST: purchase payment
router.post('/', authMiddleware(), paymentController.processPayment);

// GET: Get all payments
router.get('/', authMiddleware(['admin']), paymentController.getAllPayments); // Auth required for admin

// GET: Get a specific payment by ID
router.get('/:id', authMiddleware(['admin']), paymentController.getPaymentById);

// PUT: Update a payment by ID
router.put('/:id', authMiddleware(), paymentController.updatePayment);

// DELETE: Delete a payment by ID
router.delete('/:id', authMiddleware(['admin']), paymentController.deletePayment);
module.exports = router;
