const express = require('express');
const reviewController = require('../controllers/reviewController'); // Ensure this path is correct
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint to leave a review (auth required)
router.post('/:userId/reviews', authMiddleware(), reviewController.submitReview);

// Add more routes related to reviews (like fetching, deleting, etc.) as needed

module.exports = router;
