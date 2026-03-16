// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database pool (to ensure it attempts connection on boot)
const db = require('./config/database'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

// Static File Serving
// Expose the public folder for the simple UI frontend
app.use('/public', express.static(path.join(__dirname, 'public')));
// Expose the uploads folder so uploaded incident images can be viewed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'SCSS API is running.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 SCSS Server running on port ${PORT}`);
});