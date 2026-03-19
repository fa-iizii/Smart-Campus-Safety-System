// middleware/iotAuth.js
exports.verifyIotKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    // Check if the key exists and matches the .env file
    if (!apiKey || apiKey !== process.env.IOT_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    
    next();
};