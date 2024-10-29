const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel'); // Adjust the path if necessary

// Middleware to check authentication and optionally check for roles
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Check for token in headers
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided, access denied.' });
            }

            // Verify token and decode payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in .env

            // Fetch the user from the database
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found, access denied.' });
            }

            // Attach the user and userId to the request for later use
            req.user = user;
            req.userId = user.id;

            // If roles are specified, check if the user's role matches
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
            }

            next(); // User is authenticated and authorized
        } catch (error) {
            // Differentiate token errors for better feedback
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token, access denied.' });
            }
            console.error('Authentication error:', error); // Log for debugging
            res.status(500).json({ message: 'Internal server error during authentication.' });
        }
    };
};

module.exports = authMiddleware;
