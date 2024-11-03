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

// PUT /payments/:id: Update a payment by ID
exports.updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentMethod, status } = req.body;
        const userId = req.user.id;  // Ensure this is set correctly from authentication middleware

        // Log to debug the userId and the request data
        console.log("Requesting user ID:", userId);

        // Find the payment by ID
        const payment = await Payment.findByPk(id);

        // Check if payment exists
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Log the payment's userId to compare with the requesting user
        console.log("Payment user ID:", payment.userId);

        // Verify if the payment belongs to the requesting user
        if (payment.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only update your own payments' });
        }

        // Update payment details if provided
        if (paymentMethod) payment.paymentMethod = paymentMethod;
        if (status) payment.status = status;
        
        // Save the updated payment
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment updated successfully',
            payment,
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment',
            error: error.message,
        });
    }
};


// GET /payments/:id: Get a specific payment by ID
exports.getPaymentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment',
            error: error.message,
        });
    }
};

// DELETE /payments/:id: Delete a payment by ID
exports.deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        await payment.destroy();
        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payment',
            error: error.message,
        });
    }
};
