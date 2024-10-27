const { User } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body; 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add logging to check if the data is being passed correctly
    console.log("Registering user with data:", { name, email, hashedPassword });

    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error); // Log error details
    res.status(500).json({ error: error.message });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Updated to match the SQL structure
    const user = await User.findOne({ where: { email } }); // Use email for login
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ 
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // Use findByPk instead of findById
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
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
    const user = await User.findByPk(req.params.userId); // Use findByPk instead of findById
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy(); // Assuming you are using Sequelize or similar ORM
    res.status(204).json(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
