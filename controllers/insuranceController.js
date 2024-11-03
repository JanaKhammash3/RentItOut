const Insurance = require('../models/insuranceModel');
const Rental = require('../models/rentalModel');
const { User } = require('../models/userModel');

// Admin-only function to add insurance for a rental
exports.addInsurance = async (req, res) => {
    try {
        const { userId, itemId, coverageAmount } = req.body;

        // Validate user and rental existence
        const user = await User.findByPk(userId);
        const rental = await Rental.findOne({ where: { itemId, renterId: userId } });
        if (!user || !rental) {
            return res.status(404).json({ success: false, message: 'User or Rental not found' });
        }

        // Add insurance
        const newInsurance = await Insurance.create({
            userId,
            itemId,
            coverageAmount,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Insurance added successfully',
            insurance: newInsurance
        });
    } catch (error) {
        console.error('Error adding insurance:', error);
        res.status(500).json({ success: false, message: 'Failed to add insurance', error: error.message });
    }
};

// Fetch insurance for a specific rental
exports.getInsurance = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const insurance = await Insurance.findOne({ where: { rentalId } });

        if (!insurance) {
            return res.status(404).json({ success: false, message: 'Insurance not found' });
        }

        res.status(200).json({ success: true, insurance });
    } catch (error) {
        console.error('Error fetching insurance:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch insurance', error: error.message });
    }
};
