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
router.post('/verify', authMiddleware(), userController.verifyUser);
//review
router.post('/:userId/reviews', authMiddleware(), userController.submitReview);

module.exports = router;