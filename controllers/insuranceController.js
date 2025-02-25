const Insurance = require('../models/insuranceModel');
const Rental = require('../models/rentalModel');
const { User } = require('../models/userModel');
const Item = require('../models/itemModel');


exports.addInsurance = async (req, res) => {
    try {
        const { userId, itemId, rentalId, coverageAmount, status } = req.body;

     
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

       
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
      
        const rental = await Rental.findByPk(rentalId);
        if (!rental) {
            return res.status(404).json({ success: false, message: 'Rental not found' });
        }

        
        const newInsurance = await Insurance.create({
            userId: user.id,
            itemId: item.id,
            rentalId: rental.id,
            coverageAmount,
            status,
        });

        res.status(201).json({
            success: true,
            message: 'Insurance added successfully',
            insurance: newInsurance,
        });
    } catch (error) {
        console.error('Error in addInsurance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add insurance',
            error: error.message,
        });
    }
};


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
