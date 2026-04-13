const cron = require('node-cron');
const db = require('../config/database'); // Ensure this points to your DB config

// Schedule: '0 2 * * *' means "Run at minute 0, hour 2 (2:00 AM), every day"
cron.schedule('0 2 * * *', async () => {
    console.log('🧹 [CRON] Starting nightly database pruning at 2:00 AM...');

    try {
        // The SQL Command: Delete only CLOSED doors that are older than 7 days
        const [result] = await db.execute(`
            DELETE FROM sensor_logs 
            WHERE door_status = 'CLOSED' 
            AND logged_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        console.log(`✅ [CRON] Pruning complete. Deleted ${result.affectedRows} old 'CLOSED' logs.`);
    } catch (error) {
        console.error('❌ [CRON] Error during database pruning:', error);
    }
});

console.log('🕒 Background Cron Jobs initialized.');