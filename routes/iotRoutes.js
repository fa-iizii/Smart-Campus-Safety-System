// routes/iotRoutes.js
const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');
const { verifyIotKey } = require('../middleware/iotAuth');

// POST route protected by the verifyIotKey middleware
router.post('/log', verifyIotKey, iotController.logSensorData);

module.exports = router;