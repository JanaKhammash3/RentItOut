const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel'); // Adjust the path if necessary

// Middleware to check authentication and optionally check for roles
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Check for token in headers
            const token = req.headers['authorization']?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided, access denied.' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have a JWT_SECRET in your .env
            req.user = await User.findByPk(decoded.id); // Fetch the user from the database

            // If user not found
            if (!req.user) {
                return res.status(401).json({ message: 'User not found, access denied.' });
            }

            // Assign user ID for later use
            req.userId = req.user.id; // Set the userId to be accessed in the routes

            // If roles are specified, check user's role
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
            }

            next(); // User is authenticated and authorized
        } catch (error) {
            console.error("Authentication error:", error); // Log error details
            res.status(401).json({ message: 'Invalid token, access denied.' });
        }
    };
};

module.exports = authMiddleware;
