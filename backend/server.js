// // Load environment variables
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// const dbConfig = require('./config/db.json');
// const User = require('./models/User'); // Keep this for user lookup in router
// const { authenticate } = require('./middlewares/authMiddleware');

// const app = express();
// const server = http.createServer(app);

// // Middleware setup
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:5000'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Serve static files for PDF downloads
// app.use('/Uploads/financial-reports', express.static('Uploads/financial-reports'));
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/calendar', calendarRoutes);

// //messagerie
// app.use('/api/chat', chatRoutes);

// // Fetch user data by ID (API route)
// app.get('/api/users/:id', authenticate, async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await User.findById(id).select('-password');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json({ user });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // rag advanced chatbot (generative)
// app.use('/api/rag', chatbotRoutes);

// // Chatbot (simple chatbot) 
// app.use('/api/chatBot', chatBotRoutes);

// // Dashboard routes
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/receipts', receiptRoutes);

// // Base route
// app.get('/', (req, res) => {
//     res.send('Welcome to AccountingManagementApp');
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });