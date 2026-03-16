// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Role is hardcoded to 'user' to prevent privilege escalation
        await db.execute(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, "user")',
            [username, hashedPassword]
        );
        
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Registration failed due to a server error.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials.' });

        // Generate JWT token containing the user's ID and Role
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        res.status(200).json({ token, role: user.role, message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed due to a server error.' });
    }
};