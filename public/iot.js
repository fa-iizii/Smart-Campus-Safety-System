// public/iot.js
const token = localStorage.getItem('token');

async function fetchSensorData() {
    try {
        const res = await fetch('/api/iot/data', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const tableBody = document.getElementById('sensor-data');
        tableBody.innerHTML = ''; // Clear old rows

        data.forEach(log => {
            const row = document.createElement('tr');
            
            // Logic for Fire Exit Status Styling
            const statusClass = log.door_status === 'OPEN' ? 'status-danger' : 'status-safe';
            
            row.innerHTML = `
                <td>${new Date(log.logged_at).toLocaleString()}</td>
                <td>${log.temperature}°C</td>
                <td>${log.humidity}%</td>
                <td><span class="status-badge ${statusClass}">${log.door_status}</span></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Failed to fetch IoT data:", err);
    }
}

// Initial load and then refresh every 5 seconds
fetchSensorData();
setInterval(fetchSensorData, 5000);