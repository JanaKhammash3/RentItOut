// middleware/validateRequest.js
exports.validateRequest = (req, res, next) => {
    const { userId, rentalId, amount, paymentMethodId } = req.body;

    // Check for required fields
    if (!userId || !rentalId || !amount || !paymentMethodId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, rentalId, amount, paymentMethodId',
        });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount. It must be a positive number.',
        });
    }

    next(); // If validation passes, proceed to the next middleware/controller
};
