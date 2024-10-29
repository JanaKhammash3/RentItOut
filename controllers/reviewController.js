const { Review, User } = require('../models/userModel'); // Ensure this path is correct
exports.submitReview = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the reviewer is verified
        if (!req.user.isVerified) {
            return res.status(403).json({ message: 'Only verified users can leave reviews.' });
        }

        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
        }

        // Create the review
        const review = await Review.create({
            userId: user.id, // User being reviewed
            reviewerId: req.user.id, // The user leaving the review
            rating,
            comment
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({ message: 'Server error during review submission' });
    }
};
