// scripts/seedSecurity.js
const bcrypt = require('bcrypt');
const db = require('../config/database');

async function seedSecurity() {
    try {
        // Replace 'SuperSecurePassword123' with your actual desired password
        const hashedPassword = await bcrypt.hash('SuperSecurePassword123', 10);
        
        // Using INSERT IGNORE so running this script multiple times won't crash if the account exists
        await db.execute(
            `INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'security')`,
            ['security_admin', hashedPassword]
        );
        
        console.log('✅ Centralized Security account seeded successfully.');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedSecurity();