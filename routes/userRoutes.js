const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const router = express.Router();

// User registration and login
router.post('/register', userController.registerUser); // No auth needed
router.post('/login', userController.loginUser); // No auth needed
router.get('/profile', authMiddleware(), userController.getProfile); // Auth required
// Admin route example: Delete a user (only accessible by admin)
router.delete('/:userId', authMiddleware(['admin']), userController.deleteUser); // Auth required

// Endpoint to submit verification documents
router.post('/verify', authMiddleware(), async (req, res) => { // Ensure auth middleware is applied
    try {
        const user = await User.findById(req.user.id); 
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        user.verificationDocuments.push(...req.body.documents); 
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Endpoint to leave a review
router.post('/:userId/reviews', authMiddleware(), async (req, res) => { // Ensure auth middleware is applied
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const review = {
            reviewerId: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        user.reviews.push(review);
        await user.save();

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
