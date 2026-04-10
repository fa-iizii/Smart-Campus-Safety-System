// controllers/iotController.js
const db = require('../config/database');

exports.logSensorData = async (req, res) => {
    // 1. We now expect the ESP32 to tell us WHO it is
    const { device_id, temperature, humidity, door_status } = req.body;

    if (!device_id) {
        return res.status(400).json({ error: 'Missing device_id in payload' });
    }

    try {
        // 2. Check if the device is registered AND turned ON
        const [devices] = await db.execute('SELECT is_active FROM devices WHERE device_id = ?', [device_id]);
        
        if (devices.length === 0) {
            return res.status(404).json({ error: 'Unregistered device' });
        }
        if (devices[0].is_active === 0) {
            // The dial is turned "OFF", so we ignore the data
            return res.status(200).json({ message: 'Device is disabled. Data ignored.' });
        }

        // 3. Log the data, now attached to the specific device
        await db.execute(
            'INSERT INTO sensor_logs (device_id, temperature, humidity, door_status) VALUES (?, ?, ?, ?)',
            [device_id, temperature, humidity, door_status]
        );

        res.status(200).json({ message: 'Data logged successfully' });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Failed to save data' });
    }
};

// NEW function for the Security Dashboard (Upgraded with JOIN)
exports.getLatestData = async (req, res) => {
    try {
        // We JOIN the devices table to get the friendly name and location!
        const [logs] = await db.execute(`
            SELECT sl.*, d.device_name, d.location 
            FROM sensor_logs sl
            JOIN devices d ON sl.device_id = d.device_id
            ORDER BY sl.logged_at DESC 
            LIMIT 50
        `);
        res.status(200).json(logs);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
};