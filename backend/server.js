const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dbConfig = require('./config/db.json');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const purchaseRoutes = require('./routes/purchaseRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const Product = require('./models/Product');
const expenseRoutes = require('./routes/expenseRoutes');
const invoice1Routes = require('./routes/invoice1Routes');
const { authenticate } = require('./middlewares/authMiddleware');
const taxReportsRoutes = require('./routes/taxReportsRoutes');
const businessRoutes = require('./routes/businessRoutes');
const cookieParser = require('cookie-parser');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollsRoutes');
const journalRoutes = require('./routes/journalRoutes');
const dailyRevenueRoutes = require('./routes/dailyRevenueRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const financialStatementRoutes = require('./routes/financialStatementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();
const initializeSocket = require('./middlewares/socketHandler');
const server = http.createServer(app);
const io = initializeSocket(server);

const chatRoutes = require('./routes/chatRoutes.js');
const chatBotRoutes = require('./routes/chatBot.js');
const chatbotRoutes = require('./routes/chatbotRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

// MongoDB connection
mongoose.connect(dbConfig.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Add io to request object for all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoices1', invoice1Routes);
app.use('/uploads', express.static('uploads'));
app.use('/api/expenses', expenseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/taxReports', taxReportsRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/daily-revenue', dailyRevenueRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/financial-Statement', financialStatementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);

//messagerie
app.use('/api/chat', chatRoutes);

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

// rag advanced chatbot (generative)
app.use('/api/rag', chatbotRoutes);

// Chatbot (simple chatbot) 
app.use('/api/chatBot', chatBotRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to AccountingManagementApp');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});