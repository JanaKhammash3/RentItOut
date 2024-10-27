const Insurance = require('../models/insuranceModel'); // Import Insurance model
const User = require('../models/userModel'); // Import User model
const Item = require('../models/itemModel'); // Import Item model


// POST /insurance: Purchase insurance
exports.purchaseInsurance = async (req, res, next) => {
    try {
        const { userId, itemId, coverageAmount } = req.body;

        const user = await User.findByPk(userId);
        const item = await Item.findByPk(itemId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Create a new insurance policy
        const newInsurance = await Insurance.create({
            userId,
            itemId,
            coverageAmount,
            status: 'active',
        });

        res.status(201).json({
            success: true,
            message: 'Insurance purchased successfully',
            insurance: newInsurance,
        });
    } catch (error) {
        next(error); // Pass to error handling middleware
    }
};

// GET /insurance/:userId: Get all insurances for a user
exports.getUserInsurances = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const insurances = await Insurance.findAll({ where: { userId } });

        if (!insurances.length) {
            return res.status(404).json({ message: 'No insurance policies found' });
        }

        res.status(200).json(insurances);
    } catch (error) {
        next(error);
    }
};

// DELETE /insurance/:insuranceId: Cancel an insurance policy
exports.cancelInsurance = async (req, res, next) => {
    try {
        const { insuranceId } = req.params;
        const insurance = await Insurance.findByPk(insuranceId);

        if (!insurance) {
            return res.status(404).json({ message: 'Insurance not found' });
        }

        insurance.status = 'canceled';
        await insurance.save();

        res.status(200).json({ message: 'Insurance canceled', insurance });
    } catch (error) {
        next(error);
    }
};
