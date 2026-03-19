// Inside routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST route to send a message. 
// 1. verifyToken ensures they are logged in.
// 2. upload.single('image') handles the optional photo of the broken glass.
router.post('/send', verifyToken, upload.single('image'), chatController.sendMessage);

// GET route to load the conversation history when they open the app
router.get('/history', verifyToken, chatController.getChatHistory);

// ADD THIS NEW ROUTE:
router.get('/active-users', verifyToken, chatController.getActiveUsers);

module.exports = router;