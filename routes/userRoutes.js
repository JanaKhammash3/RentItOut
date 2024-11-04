const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { User, Review } = require('../models/userModel'); 

const router = express.Router();

//registration and login routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware(), userController.logoutUser);

//profile routes 
router.get('/profile', authMiddleware(), userController.getProfile);
router.put('/profile', authMiddleware(), userController.updateUserProfile);

//Delete a user (for admin)
router.delete('/:userId', authMiddleware(['admin']), userController.deleteUser);

//verify the user
router.post('/verify', authMiddleware(), async (req, res) => {
    try {
        const { idNumber, phone, address } = req.body;

        // Validations
        if (!idNumber || !phone || !address) {
            return res.status(400).json({ error: 'ID number, phone, and address are required.' });
        }
        if (!/^\d+$/.test(idNumber)) {
            return res.status(400).json({ error: 'ID number must contain only numeric characters.' });
        }
        if (!/^\d+$/.test(phone)) {
            return res.status(400).json({ error: 'Phone must contain only numeric characters.' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // idNumber&phone?match
        if (user.idNumber !== idNumber || user.phone !== phone) {
            return res.status(400).json({ error: 'ID number or phone does not match with existing account.' });
        }

        // Update address & verification status
        user.address = address; 
        user.isVerified = true; 
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User verified successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

//review
router.post('/:userId/reviews', authMiddleware(), userController.submitReview);

module.exports = router;
