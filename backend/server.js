const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dbConfig = require('./config/db.json'); // MongoDB connection config
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes'); // User routes
const productRoutes = require('./routes/productRoutes'); // Product routes
const User = require('./models/User'); // Import the User model
const Product = require('./models/Product'); // Import the Product model
const authenticate = require('./middlewares/authMiddleware'); // Authentication middleware
const taxReportsRoutes = require('./routes/taxReportsRoutes');
const app = express();

// MongoDB connection
mongoose.connect(dbConfig.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', method: 'GET,POST', credentials: true }));
app.use(express.json());  // To parse JSON request bodies

// Routes
app.use('/api/users', userRoutes);

// Product routes (added)
app.use('/api/products', productRoutes);  // Products routes

// Fetch user data by ID (API route)
app.get('/api/users/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.use('/api/taxReports', taxReportsRoutes);  // Tax Reports routes

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to AccountingManagementApp');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
