const Payment = require('../models/paymentModel'); 
const Rental = require('../models/rentalModel');
const { User } = require('../models/userModel');

// POST: Process rental payments
exports.processPayment = async (req, res, next) => {
    try {
        const { rentalId, paymentMethod } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ success: false, message: 'Rental not found' });
        }
        console.log(`Rental RenterId: ${rental.renterId}, Current UserId: ${userId}`);

        if (rental.renterId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Rental does not belong to the user' });
        }

        const amount = rental.totalCost;

        let paymentStatus;
        if (paymentMethod === 'card') {
            paymentStatus = 'confirmed';
        } else if (paymentMethod === 'cash') {
            paymentStatus = 'pending'; 
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }

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

// GET: Get all payments
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

// PUT: Update a payment by ID
exports.updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentMethod, status } = req.body;
        const userId = req.user.id; 

        console.log("Requesting user ID:", userId);

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        console.log("Payment user ID:", payment.userId);

        if (payment.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only update your own payments' });
        }

        if (paymentMethod) {
            payment.paymentMethod = paymentMethod;

            if (paymentMethod === 'card') {
                payment.status = 'confirmed';
            } else if (paymentMethod === 'cash') {
                payment.status = 'pending';
            }
        }

        if (status && !paymentMethod) {
            payment.status = status;
        }

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


// GET: Get a specific payment by ID
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



// DELETE: Delete a payment by ID
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
