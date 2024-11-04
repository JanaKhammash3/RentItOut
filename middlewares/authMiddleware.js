const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel'); 

const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided, access denied.' });
            }

            
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found, access denied.' });
            }

            
            req.user = user;
            req.userId = user.id;

           
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' });
            }

            next(); 
        } catch (error) {
            
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token, access denied.' });
            }
            console.error('Authentication error:', error); 
            res.status(500).json({ message: 'Internal server error during authentication.' });
        }
    };
};

module.exports = authMiddleware;
