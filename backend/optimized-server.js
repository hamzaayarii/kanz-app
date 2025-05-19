// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dbConfig = require('./config/db.json');
const User = require('./models/User');
const { authenticate } = require('./middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Basic health check route that doesn't depend on other modules
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

// Static file serving - moved up for faster access
app.use('/uploads', express.static('uploads'));
app.use('/Uploads/financial-reports', express.static('Uploads/financial-reports'));

// Welcome route
app.get('/', (req, res) => {
    res.send('Welcome to AccountingManagementApp');
});

// Establish MongoDB connection with optimized settings
mongoose.connect(dbConfig.mongodb.url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    connectTimeoutMS: 10000, // 10 seconds
    serverSelectionTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
})
.then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize socket after DB connection is established
    const initializeSocket = require('./middlewares/socketHandler');
    const io = initializeSocket(server);
    
    // Add io to request object for all routes
    app.use((req, res, next) => {
        req.io = io;
        next();
    });

    // Only load routes after MongoDB connection is established
    registerRoutes(app);
    
    // Start the server after all routes and services are initialized
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit with error code if MongoDB connection fails
});

// Function to register all routes - lazily loaded
function registerRoutes(app) {
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

    // User routes
    app.use('/api/users', require('./routes/userRoutes'));
    
    // Product related routes
    app.use('/api/products', require('./routes/productRoutes'));
    app.use('/api/purchases', require('./routes/purchaseRoutes'));
    
    // Financial routes
    app.use('/api/invoices', require('./routes/invoiceRoutes'));
    app.use('/api/invoices1', require('./routes/invoice1Routes'));
    app.use('/api/expenses', require('./routes/expenseRoutes'));
    app.use('/api/employees', require('./routes/employeeRoutes'));
    app.use('/api/payrolls', require('./routes/payrollsRoutes'));
    app.use('/api/taxReports', require('./routes/taxReportsRoutes'));
    app.use('/api/business', require('./routes/businessRoutes'));
    app.use('/api/journal', require('./routes/journalRoutes'));
    app.use('/api/daily-revenue', require('./routes/dailyRevenueRoutes'));
    app.use('/api/categories', require('./routes/categoryRoutes'));
    app.use('/api/financial-Statement', require('./routes/financialStatementRoutes'));
    app.use('/api/income-statement', require('./routes/IncomeStatementRoutes'));
    app.use('/api/anomalies', require('./routes/anomalyDetectionRoutes'));
    app.use('/api/predictCashFlow', require('./routes/predictCashFlowRoutes'));
    app.use('/api/treasury', require('./routes/treasuryRoutes'));
    
    // Notification and scheduling routes
    app.use('/api/notifications', require('./routes/notificationRoutes'));
    app.use('/api/calendar', require('./routes/calendarRoutes'));
    
    // Chat related routes
    app.use('/api/chat', require('./routes/chatRoutes'));
    app.use('/api/rag', require('./routes/chatbotRoutes'));
    app.use('/api/chatBot', require('./routes/chatBot'));
    
    // Dashboard and receipts
    app.use('/api/dashboard', require('./routes/dashboardRoutes'));
    app.use('/api/receipts', require('./routes/ReceiptRoute'));
}

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    });
    
    // Force close if graceful shutdown fails
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}
