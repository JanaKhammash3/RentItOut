const { User } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, idNumber } = req.body;

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

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    const existingID = await User.findOne({ where: { idNumber } });
    if (existingUser) return res.status(400).json({ error: 'Email is already in use.' });
    if (existingID) return res.status(400).json({ error: 'ID number is already in use.' });

    // Hash the password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone, idNumber });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
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
  // For now, just return a message; you might want to implement token invalidation
  res.status(200).json({ success: true, message: 'User logged out successfully' });
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user (make sure this function is defined)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(204).json(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
