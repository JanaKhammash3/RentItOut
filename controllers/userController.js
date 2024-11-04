const { User } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  Review  = require('../models/reviewModel'); 
const tokenBlacklist = [];

//check if a token is blacklisted
const isTokenBlacklisted = (token) => tokenBlacklist.includes(token);

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    // Default role to 'user'
    const { name, email, password, phone, idNumber, role } = req.body; 

    // Validations
    if (!name || !email || !password || !phone || !idNumber) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 5) {
      return res.status(400).json({ error: 'Password must be at least 5 characters long.' });
    }
    if (!/^\d+$/.test(phone) || !/^\d+$/.test(idNumber)) {
      return res.status(400).json({ error: 'Phone and ID must contain only numeric characters.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    //the role is 'user' or 'admin'
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ error: 'Role must be either "user" or "admin".' });
  }

    //see if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    const existingID = await User.findOne({ where: { idNumber } });
    if (existingUser) return res.status(400).json({ error: 'Email is already in use.' });
    if (existingID) return res.status(400).json({ error: 'ID number is already in use.' });

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone, idNumber, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, isVerified: user.isVerified, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  tokenBlacklist.push(token); // Add token to blacklist
  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

//for reviewing
exports.submitReview = async (req, res) => {
  try {
      const user = await User.findByPk(req.params.userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // if the reviewer verified
      if (!req.user.isVerified) {
          return res.status(403).json({ message: 'Your account is not verified. You cannot leave a review.' });
      }

      const { rating, comment } = req.body;

      //rating instructions
      if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
      }

      // Create the review
      const review = await Review.create({
          userId: user.id,        
          reviewerId: req.user.id, 
          rating,
          comment
      });

      res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
      console.error('Review submission error:', error);
      res.status(500).json({ message: 'Server error during review submission', error: error.message });
  }
};

const { Op } = require('sequelize'); 

exports.verifyUser = async (req, res) => {
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

    // Check if idNumber or phone are used by other users
    const conflictingID = await User.findOne({ where: { idNumber, id: { [Op.ne]: user.id } } });
    const conflictingPhone = await User.findOne({ where: { phone, id: { [Op.ne]: user.id } } });

    if (conflictingID) return res.status(400).json({ error: 'ID number is already in use by another account.' });
    if (conflictingPhone) return res.status(400).json({ error: 'Phone number is already linked to another account.' });

    // idNumber&phone match
    if (user.idNumber !== idNumber || user.phone !== phone) {
      return res.status(400).json({ error: 'Provided ID number or phone number does not match our records.' });
    }

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
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Invalid session. Please log in again.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address:user.address,
        isVerified:user.isVerified,
        role:user.role,
        idNumber:user.idNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must contain only numeric characters.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update fields
    user.name = name;
    user.email = email;
    user.phone = phone;

    // Save profile
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(204).json(); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
