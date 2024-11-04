const express = require('express');
const reviewController = require('../controllers/reviewController'); 
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// to leave a review
router.post('/:userId/reviews', authMiddleware(), reviewController.submitReview);

module.exports = router;