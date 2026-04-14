// controllers/iotController.js
const db = require('../config/database');

// 1. The Piggyback Function
exports.logSensorData = async (req, res) => {
    const { device_id, temperature, humidity, door_status } = req.body;

    if (!device_id) return res.status(400).json({ error: 'Missing device_id' });

    try {
        // We now select 'alarm_active' along with 'is_active'
        const [devices] = await db.execute('SELECT is_active, alarm_active FROM devices WHERE device_id = ?', [device_id]);
        
        if (devices.length === 0) return res.status(404).json({ error: 'Unregistered device' });
        if (devices[0].is_active === 0) return res.status(200).json({ message: 'Device disabled' });

        await db.execute(
            'INSERT INTO sensor_logs (device_id, temperature, humidity, door_status) VALUES (?, ?, ?, ?)',
            [device_id, temperature, humidity, door_status]
        );

        // 🚨 THE PIGGYBACK: We send the alarm status back to the ESP32!
        res.status(200).json({ 
            message: 'Data logged successfully',
            command: {
                sound_alarm: devices[0].alarm_active === 1 // Converts SQL 1/0 to JS true/false
            }
        });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Failed to save data' });
    }
};

// 2. The Dashboard Fetcher (Upgraded to include alarm state)
exports.getLatestData = async (req, res) => {
    try {
        const [logs] = await db.execute(`
            SELECT sl.*, d.device_name, d.location, d.alarm_active 
            FROM sensor_logs sl
            JOIN devices d ON sl.device_id = d.device_id
            ORDER BY sl.logged_at DESC 
            LIMIT 50
        `);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
};

// 3. NEW: The Command Switch (For the Security Team)
exports.toggleAlarm = async (req, res) => {
    const { device_id, alarm_active } = req.body;
    try {
        await db.execute('UPDATE devices SET alarm_active = ? WHERE device_id = ?', [alarm_active, device_id]);
        res.status(200).json({ message: 'Alarm state updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger alarm' });
    }
};

// (Keep your registerDevice function here at the bottom if you still have it!)

// Add to the bottom of controllers/iotController.js

exports.registerDevice = async (req, res) => {
    const { device_id, device_name, location } = req.body;

    // Basic validation
    if (!device_id || !device_name || !location) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Enforce Unique ID: Check if the device_id already exists
        const [existing] = await db.execute('SELECT device_id FROM devices WHERE device_id = ?', [device_id]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'A device with this ID already exists.' });
        }

        // Insert the new device (is_active defaults to TRUE based on our table schema)
        await db.execute(
            'INSERT INTO devices (device_id, device_name, location) VALUES (?, ?, ?)',
            [device_id, device_name, location]
        );

        res.status(201).json({ message: 'Sensor registered successfully!' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: 'Failed to register the device.' });
    }
};