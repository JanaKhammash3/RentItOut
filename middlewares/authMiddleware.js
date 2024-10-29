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

            // Verify token and decode payload
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have a JWT_SECRET in your .env
            } catch (error) {
                console.error('Token verification error:', error);
                return res.status(401).json({ message: 'Invalid token, access denied.' });
            }

            // Fetch the user from the database
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found, access denied.' });
            }

            req.user = user; // Attach the user object to the request
            req.userId = user.id; // Set the userId to be accessed in the routes

            // If roles are specified, check user's role
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
            }

            next(); // User is authenticated and authorized
        } catch (error) {
            console.error('Authentication error:', error); // Log the error for debugging
            res.status(500).json({ message: 'Internal server error during authentication.' });
        }
    };
};

module.exports = authMiddleware;
