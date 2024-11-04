exports.validateRequest = (req, res, next) => {
    const { userId, rentalId, amount } = req.body;

    // Check for required fields
    if (!userId || !rentalId || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, rentalId, amount, paymentMethodId',
        });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount. It must be a positive number.',
        });
    }

    next(); 
};
