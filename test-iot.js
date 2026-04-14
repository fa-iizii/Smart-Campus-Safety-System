// test-iot.js
// Simulates an ESP32 sending live data every 5 seconds and listening for commands

async function sendFakeIoTData() {
    // Generate some realistic randomized data
    const temp = (Math.random() * (25.0 - 18.0) + 18.0).toFixed(1); // Between 18 and 25 C
    const hum = (Math.random() * (55.0 - 40.0) + 40.0).toFixed(1);  // Between 40 and 55 %
    
    // Simulate someone occasionally opening the fire exit (20% chance)
    // (Change this to > 0.0 if you want to force it OPEN every time for testing)
    const isDoorOpen = Math.random() > 0.8; 
    const doorStatus = isDoorOpen ? 'OPEN' : 'CLOSED';

    try {
        const response = await fetch('http://localhost:3000/api/iot/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'alpha47_iot_api_key' // Your actual .env secure key
            },
            body: JSON.stringify({
                // Change this to 'ESP32_TEST_02' if you want to test your newly registered sensor
                device_id: 'ESP32_MAIN_01', 
                temperature: parseFloat(temp),
                humidity: parseFloat(hum),
                door_status: doorStatus
            })
        });

        if (response.ok) {
            // Read the JSON reply from the Node.js server!
            const reply = await response.json();
            
            console.log(`📡 Data Sent | Temp: ${temp}°C | Hum: ${hum}% | Door: ${doorStatus}`);
            
            // 🚨 THE HARDWARE ACTION (TWO-WAY COMMUNICATION)
            if (reply.command && reply.command.sound_alarm === true) {
                console.log(`   🚨 SERVER COMMAND: SOUNDING PHYSICAL SIREN NOW! 🚨\n`);
                // (In C++, this is where we would say: digitalWrite(BUZZER_PIN, HIGH); )
            } else {
                console.log(`   ✅ SERVER COMMAND: Area Secure. Siren Off.\n`);
            }

        } else {
            const errorData = await response.json();
            console.error('⚠️ Server rejected the data:', errorData.error || errorData.message);
        }
    } catch (error) {
        console.error('❌ Failed to reach the server. Is it running?', error.message);
    }
}

console.log('🚀 Starting Command & Control ESP32 Simulator... Press Ctrl+C to stop.');
// Send first reading immediately, then every 5 seconds
sendFakeIoTData();
setInterval(sendFakeIoTData, 5000);