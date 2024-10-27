const Payment = require('../models/paymentModel'); // Import the Payment model
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Load Stripe with secret key

// POST /payments: Process rental payments and deposits
exports.processPayment = async (req, res, next) => {
    try {
        const { userId, rentalId, amount, paymentMethodId, currency = 'usd' } = req.body;

        // 1. Process payment via Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to smallest currency unit (cents for USD)
            currency,
            payment_method: paymentMethodId,
            confirm: true, // Confirm the payment immediately
        });

        // 2. Save payment details to MySQL
        const newPayment = await Payment.create({
            userId,
            rentalId,
            amount,
            paymentMethod: paymentIntent.payment_method,
            status: paymentIntent.status, // Store the status from Stripe
        });

        // 3. Respond with success message and payment data
        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            payment: newPayment,
            paymentIntent,
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message,
        });
    }
};

// GET /payments: Get all payments
exports.getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.findAll(); // Example using Sequelize
        res.status(200).json({
            success: true,
            payments,
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: error.message,
        });
    }
};
