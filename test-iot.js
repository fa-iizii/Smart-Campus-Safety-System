// test-iot.js

// This script acts exactly like your ESP32 sending data over Wi-Fi
async function simulateESP32() {
    try {
        const response = await fetch('http://localhost:3000/api/iot/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Make sure this matches the IOT_API_KEY in your .env file exactly!
                'x-api-key': 'alpha47_iot_api_key' 
            },
            body: JSON.stringify({
                temperature: 22.5,
                humidity: 45.2,
                door_status: 'OPEN'
            })
        });

        const data = await response.json();
        console.log(`Status Code: ${response.status}`);
        console.log('Server Response:', data);

    } catch (error) {
        console.error('Failed to reach the server:', error.message);
    }
}

simulateESP32();