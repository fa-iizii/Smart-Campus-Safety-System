// controllers/chatController.js
const db = require('../config/database');

exports.sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const { message_content, receiver_id } = req.body;
    
    // Check if an image was uploaded via multer
    const imagePath = req.file ? req.file.path : null;

    // Ensure they are sending either text, an image, or both
    if (!message_content && !imagePath) {
        return res.status(400).json({ error: 'Please provide text or an image to send.' });
    }

    try {
        let finalReceiverId = receiver_id;

        // Auto-route student/employee messages directly to the Security Team
        if (senderRole === 'user') {
            const [securityUsers] = await db.execute('SELECT id FROM users WHERE role = "security" LIMIT 1');
            if (securityUsers.length === 0) {
                return res.status(500).json({ error: 'Critical Error: Security account not found.' });
            }
            finalReceiverId = securityUsers[0].id;
        } 
        // Enforce that the security team specifies who they are replying to
        else if (senderRole === 'security' && !receiver_id) {
            return res.status(400).json({ error: 'Security team must provide a receiver_id to reply.' });
        }

        // Insert the message and optional image into the database
        await db.execute(
            `INSERT INTO messages (sender_id, receiver_id, message_content, image_path) VALUES (?, ?, ?, ?)`,
            [senderId, finalReceiverId, message_content || '', imagePath]
        );

        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Chat DB Error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
};

// New function to fetch chat history for the logged-in user
exports.getChatHistory = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    try {
        let query = '';
        let params = [];

        // Standard users only see their conversation with the security team
        if (userRole === 'user') {
            query = `
                SELECT m.*, u.username as sender_name 
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.sender_id = ? OR m.receiver_id = ?
                ORDER BY m.sent_at ASC
            `;
            params = [userId, userId];
        } 
        // The security team can see all messages (or we can filter by a specific student later)
        else if (userRole === 'security') {
            query = `
                SELECT m.*, u.username as sender_name 
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                ORDER BY m.sent_at ASC
            `;
        }

        const [messages] = await db.execute(query, params);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Fetch Chat Error:', error);
        res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }
};

// NEW function to get a list of active users who have chatted with the security team
exports.getActiveUsers = async (_req, res) => {
    try {
        // This query finds all unique users who have an active chat history
        const [users] = await db.execute(`
            SELECT DISTINCT u.id, u.username 
            FROM users u
            JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
            WHERE u.role = 'user'
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching active users:", error);
        res.status(500).json({ error: 'Failed to fetch active users.' });
    }
};


// NEW function to delete chat history (for security team use only)
const fs = require('fs');
const path = require('path');

exports.deleteChatHistory = async (req, res) => {
    // The ID of the currently logged-in user
    const userId = req.user.id; 

    try {
        // 1. FIND AND DELETE PHYSICAL PHOTOS
        // Look for any images in the chat where this user was the sender OR receiver
        const [photos] = await db.execute(
            'SELECT image_path FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND image_path IS NOT NULL', 
            [userId, userId]
        );

        photos.forEach(photo => {
            if (photo.image_path) {
                // Clean up the path format (handles both Windows '\\' and Mac/Linux '/')
                const fileName = photo.image_path.replace('uploads/', '').replace('uploads\\', '');
                
                // Point perfectly to your SCSS/uploads/ folder
                const fullPath = path.join(__dirname, '../uploads', fileName);
                
                // Shred the physical file if it exists
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath); 
                }
            }
        });

        // 2. WIPE THE DATABASE TEXT
        // Delete all message rows associated with this user's conversation
        await db.execute(
            'DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', 
            [userId, userId]
        );

        res.status(200).json({ message: 'All chat history and photos permanently deleted.' });
    } catch (error) {
        console.error("Delete Chat Error:", error);
        res.status(500).json({ error: 'Failed to delete chat data.' });
    }
};