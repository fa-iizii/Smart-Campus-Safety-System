// middleware/iotAuth.js

const verifyIotKey = (req, res, next) => {
    // The ESP32 will send the API key in a custom header called 'x-api-key'
    const apiKey = req.header('x-api-key');

    if (!apiKey || apiKey !== process.env.IOT_API_KEY) {
        return res.status(401).json({ message: 'Access Denied: Invalid or missing IoT API Key.' });
    }

    next(); // Key is valid, proceed to the controller
};

module.exports = { verifyIotKey };