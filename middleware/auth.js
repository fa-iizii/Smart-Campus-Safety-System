// middleware/auth.js
const jwt = require('jsonwebtoken');

// Verifies if the incoming request has a valid JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
    
    if (!token) return res.status(401).json({ message: 'Access Denied: No token provided.' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attaches user payload (id, role) to the request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware to strictly enforce security team access
const isSecurity = (req, res, next) => {
    if (req.user.role !== 'security') {
        return res.status(403).json({ message: 'Access Denied: Security role required.' });
    }
    next();
};

module.exports = { verifyToken, isSecurity };