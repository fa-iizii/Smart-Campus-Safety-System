// public/iot.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

// We store the raw data globally so we can filter it without asking the server again
let globalSensorLogs = []; 
let alertAcknowledged = false;

async function fetchSensorData() {
    try {
        const res = await fetch('/api/iot/data', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        globalSensorLogs = await res.json();
        
        // 1. Check for Emergencies
        checkForAlerts(globalSensorLogs);
        
        // 2. Extract unique devices for the Control Panel
        renderControlPanel(globalSensorLogs);

        // 3. Apply any active filters and render the table
        applyFilters();

    } catch (err) {
        console.error("IoT Fetch Error:", err);
    }
}

// --- 🚨 ALERTS SYSTEM ---
function checkForAlerts(logs) {
    if (logs.length === 0) return;
    
    // Check the absolute latest reading (the first item in the array)
    const latestReading = logs[0];
    const banner = document.getElementById('alert-banner');

    if (latestReading.door_status === 'OPEN') {
        if (!alertAcknowledged) {
            banner.style.display = 'flex';
            banner.innerHTML = `
                <span>⚠️ EMERGENCY: ${latestReading.device_name} (${latestReading.location}) has been OPENED!</span>
                <button onclick="acknowledgeAlert()" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Acknowledge</button>
            `;
        }
    } else {
        // If the door is closed, hide the banner and reset the acknowledge flag
        banner.style.display = 'none';
        alertAcknowledged = false; 
    }
}

function acknowledgeAlert() {
    document.getElementById('alert-banner').style.display = 'none';
    alertAcknowledged = true; // Prevents it from flashing again until the door closes and re-opens
}

// --- 🔍 FILTER SYSTEM ---
function applyFilters() {
    const searchTerm = document.getElementById('search-filter').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filteredData = globalSensorLogs.filter(log => {
        // 1. Check Search Match (Location or Name)
        const nameMatch = log.device_name.toLowerCase().includes(searchTerm);
        const locMatch = log.location.toLowerCase().includes(searchTerm);
        const matchesSearch = nameMatch || locMatch;

        // 2. Check Status Match
        const matchesStatus = (statusFilter === 'ALL') || (log.door_status === statusFilter);

        return matchesSearch && matchesStatus;
    });

    renderTable(filteredData);
}

// --- 📊 TABLE RENDERING ---
function renderTable(data) {
    const tableBody = document.getElementById('sensor-data');
    tableBody.innerHTML = ''; 

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No matching data found.</td></tr>';
        return;
    }

    data.forEach(log => {
        const row = document.createElement('tr');
        const statusClass = log.door_status === 'OPEN' ? 'status-danger' : 'status-safe';
        
        row.innerHTML = `
            <td>${new Date(log.logged_at).toLocaleString()}</td>
            <td style="font-weight: 600;">${log.device_name}</td>
            <td>${log.location}</td>
            <td>${log.temperature}°C</td>
            <td>${log.humidity}%</td>
            <td><span class="status-badge ${statusClass}">${log.door_status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// --- 🎛️ CONTROL PANEL RENDERING ---
function renderControlPanel(logs) {
    const deviceList = document.getElementById('device-list');
    
    // Extract unique devices from the recent logs
    const uniqueDevices = {};
    logs.forEach(log => {
        if (!uniqueDevices[log.device_id]) {
            uniqueDevices[log.device_id] = { name: log.device_name, loc: log.location };
        }
    });

    deviceList.innerHTML = '';
    
    for (const [id, info] of Object.entries(uniqueDevices)) {
        // For now, this is a visual UI toggle. To make it physically cut off data, 
        // we would add a new PUT route to the backend to update 'is_active' in the database!
        deviceList.innerHTML += `
            <div class="device-row">
                <div class="device-info">
                    <h4>${info.name}</h4>
                    <p>ID: ${id} | ${info.loc}</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked onclick="alert('To physically disable this sensor, we need to add an UPDATE route to your backend API!')">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }
}

// Initial load and then refresh every 5 seconds
fetchSensorData();
setInterval(fetchSensorData, 5000);