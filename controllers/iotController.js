// controllers/iotController.js
const db = require('../config/database');

// Existing function for the ESP32
exports.logSensorData = async (req, res) => { 
    /* ... your existing log logic ... */ 
};

// NEW function for the Security Dashboard
exports.getLatestData = async (req, res) => {
    try {
        const [logs] = await db.execute(
            'SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 20'
        );
        res.status(200).json(logs);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
};