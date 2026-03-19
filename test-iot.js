// test-iot.js
// Simulates an ESP32 sending live data every 5 seconds

async function sendFakeIoTData() {
    // Generate some realistic randomized data
    const temp = (Math.random() * (25.0 - 18.0) + 18.0).toFixed(1); // Between 18 and 25 C
    const hum = (Math.random() * (55.0 - 40.0) + 40.0).toFixed(1);  // Between 40 and 55 %
    
    // Simulate someone occasionally opening the fire exit
    const isDoorOpen = Math.random() > 0.8; 
    const doorStatus = isDoorOpen ? 'OPEN' : 'CLOSED';

    try {
        const response = await fetch('http://localhost:3000/api/iot/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'alpha47_iot_api_key' // Must match your .env
            },
            body: JSON.stringify({
                temperature: parseFloat(temp),
                humidity: parseFloat(hum),
                door_status: doorStatus
            })
        });

        if (response.ok) {
            console.log(`📡 Data Sent | Temp: ${temp}°C | Hum: ${hum}% | Door: ${doorStatus}`);
        } else {
            console.error('⚠️ Server rejected the data. Check API key.');
        }
    } catch (error) {
        console.error('❌ Failed to reach the server. Is it running?', error.message);
    }
}

console.log('🚀 Starting ESP32 Simulator... Press Ctrl+C to stop.');
// Send first reading immediately, then every 5 seconds
sendFakeIoTData();
setInterval(sendFakeIoTData, 5000);