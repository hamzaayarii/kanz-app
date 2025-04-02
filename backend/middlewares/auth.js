const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        console.log('Token received:', token);
        console.log('Secret Key:', process.env.SECRET_KEY);

        // Verify token
        try {
            const verified = jwt.verify(token, process.env.SECRET_KEY);
            console.log('Verified token:', verified);
            req.user = verified;
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth; 