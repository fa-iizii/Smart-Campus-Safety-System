// routes/iotRoutes.js
const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Import both auth middlewares
const { verifyIotKey } = require('../middleware/iotauth'); // For the ESP32 Hardware
const { verifyToken } = require('../middleware/auth');      // For the Web Dashboard

// 1. The POST route (Used by ESP32 to send data)
router.post('/log', verifyIotKey, iotController.logSensorData);

// 2. The GET route (Used by your new iot.html to show data)
router.get('/data', verifyToken, iotController.getLatestData);

// ALWAYS keep this at the very bottom
module.exports = router;

// Add this next to your other routes in routes/iotRoutes.js
router.post('/register', verifyToken, iotController.registerDevice);