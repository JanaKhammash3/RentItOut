const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { User, Review } = require('../models/userModel'); // Import User and Review models
const router = express.Router();

// User registration and login
router.post('/register', userController.registerUser); // No auth needed
router.post('/login', userController.loginUser); // No auth needed
router.post('/logout', userController.authenticate, userController.logoutUser);

// Get user profile (auth required)
router.get('/profile', userController.authenticate, userController.getProfile);

// Admin route: Delete a user (only accessible by admin)
router.delete('/:userId', authMiddleware(['admin']), userController.deleteUser); 

// Endpoint to submit verification documents
router.post('/verify', authMiddleware(), async (req, res) => { 
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Assuming the documents are passed as an array in the request body
        user.isVerified = true;
        user.verificationDocuments = req.body.documents || []; // Initialize if undefined
        await user.save();

        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Endpoint to leave a review
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
            userId: user.id, // Associate with the user being reviewed
            reviewerId: req.user.id, // Associate with the reviewer
            rating,
            comment
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
