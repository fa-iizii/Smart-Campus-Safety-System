// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes for the simple UI
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;