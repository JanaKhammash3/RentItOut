const Payment = require('../models/paymentModel'); 
const Rental = require('../models/rentalModel');
const { User } = require('../models/userModel');

// POST /payments: Process rental payments and deposits
exports.processPayment = async (req, res, next) => {
    try {
        const { rentalId, paymentMethod } = req.body;
        const userId = req.user.id;

        // Validate user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate rental
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ success: false, message: 'Rental not found' });
        }

        // Debug log to check renterId and userId
        console.log(`Rental RenterId: ${rental.renterId}, Current UserId: ${userId}`);

        // Check if the rental belongs to the user
        if (rental.renterId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Rental does not belong to the user' });
        }

        // Use rental's totalCost for amount
        const amount = rental.totalCost;

        // Set payment status based on the payment method
        let paymentStatus;
        if (paymentMethod === 'card') {
            paymentStatus = 'confirmed';
        } else if (paymentMethod === 'cash') {
            paymentStatus = 'pending'; // Pending for cash to be manually confirmed later
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }

        // Save payment details to the database
        const newPayment = await Payment.create({
            userId,
            rentalId,
            amount,
            paymentMethod,
            status: paymentStatus,
        });

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            payment: newPayment,
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
        const payments = await Payment.findAll();
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
