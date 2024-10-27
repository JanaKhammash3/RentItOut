const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust the path if necessary

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
            req.user = decoded; // Attach user data to the request

            // If roles are specified, check user's role
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
            }

            next(); // User is authenticated and authorized
        } catch (error) {
            res.status(401).json({ message: 'Invalid token, access denied.' });
        }
    };
};

// module.exports = authMiddleware;
module.exports = () => {
    return (req, res, next) => {
        // Your authentication logic here
        // If authenticated, call next()
        // If not authenticated, respond with an error
        next();
    };
};