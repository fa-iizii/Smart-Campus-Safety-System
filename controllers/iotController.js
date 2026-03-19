// controllers/iotController.js
const db = require('../config/database');

// Existing function for the ESP32
exports.logSensorData = async (req, res) => { 
    // Extract the data sent by the ESP32
    const { temperature, humidity, door_status } = req.body;

    // Basic validation to ensure the ESP32 sent all required fields
    if (temperature === undefined || humidity === undefined || !door_status) {
        return res.status(400).json({ error: 'Missing required sensor data fields.' });
    }

    // Ensure door_status strictly matches our ENUM in the database
    if (door_status !== 'OPEN' && door_status !== 'CLOSED') {
        return res.status(400).json({ error: 'Invalid door_status. Must be OPEN or CLOSED.' });
    }

    try {
        await db.execute(
            `INSERT INTO sensor_logs (temperature, humidity, door_status) VALUES (?, ?, ?)`,
            [temperature, humidity, door_status]
        );

        res.status(201).json({ message: 'Sensor data logged successfully.' });
    } catch (error) {
        console.error('IoT DB Insert Error:', error);
        res.status(500).json({ error: 'Failed to save sensor data to the database.' });
    }

};

// NEW function for the Security Dashboard
exports.getLatestData = async (req, res) => {
    try {
        const [logs] = await db.execute(
            'SELECT * FROM sensor_logs ORDER BY logged_at DESC LIMIT 20'
        );
        res.status(200).json(logs);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
};