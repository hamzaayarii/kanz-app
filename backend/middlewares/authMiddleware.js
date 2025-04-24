const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// TODO: There is a known 403 error issue in the application that needs to be investigated and fixed.
// The error occurs in authentication flows and needs proper error handling and user feedback.
// Current workaround: Users may experience 403 errors when:
// 1. Token validation fails
// 2. Role-based access control is enforced
// 3. Business access permissions are checked
// Please investigate and implement proper error handling and user feedback mechanisms.

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

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
};

// Middleware to authorize accountants
const authorizeAccountant = (req, res, next) => {
    if (req.user.role !== 'accountant' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, accountant privileges required' });
    }
    next();
};

// Middleware to authorize business owners
const authorizeBusinessOwner = (req, res, next) => {
    if (req.user.role !== 'business_owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, business owner privileges required' });
    }
    next();
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    next();
};

module.exports = {
    authorizeAdmin,
    authenticate,
    authorizeAccountant,
    authorizeBusinessOwner
};