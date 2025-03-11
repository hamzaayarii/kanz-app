const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const authenticate = (req, res, next) => {
    // First try to get token from Authorization header
    let token = req.headers.authorization?.split(' ')[1];

    // If not in header, try to get from cookies
    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Store decoded data in request object (user info)
        next(); // Pass control to next handler
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;