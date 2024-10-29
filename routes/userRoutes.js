const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { User, Review } = require('../models/userModel'); // Ensure this path is correct

const router = express.Router();

// User registration and login routes (no auth required)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', authMiddleware(), userController.logoutUser);

// User profile routes (auth required)
router.get('/profile', authMiddleware(), userController.getProfile);
router.put('/profile', authMiddleware(), userController.updateUserProfile);

// Admin-only route: Delete a user
router.delete('/:userId', authMiddleware(['admin']), userController.deleteUser);

// Endpoint to submit verification documents (auth required)
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

        // Find the user by ID from the token
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if the provided idNumber and phone match the user's existing info
        if (user.idNumber !== idNumber || user.phone !== phone) {
            return res.status(400).json({ error: 'ID number or phone does not match with existing account.' });
        }

        // Update the user's address and verification status
        user.address = address; // Update the address
        user.isVerified = true; // Mark the user as verified
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User verified successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address, // Include address in response
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// Endpoint to leave a review (auth required)
router.post('/:userId/reviews', authMiddleware(), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { rating, comment } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const review = await Review.create({
            userId: user.id,
            reviewerId: req.user.id,
            rating,
            comment
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({ message: 'Server error during review submission' });
    }
});

module.exports = router;
