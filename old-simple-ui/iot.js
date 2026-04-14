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



// --- 🚨 UPGRADED TOAST NOTIFICATION SYSTEM ---
// We track the time of the last alert so we don't spam the same notification every 5 seconds
let lastAlertTimestamp = null; 

function checkForAlerts(logs) {
    if (logs.length === 0) return;
    
    // Check the latest reading
    const latestReading = logs[0];

    // If it's an OPEN door, AND it's a newer reading than the last one we alerted about...
    if (latestReading.door_status === 'OPEN' && latestReading.logged_at !== lastAlertTimestamp) {
        lastAlertTimestamp = latestReading.logged_at; // Update our tracker
        
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-title">🚨 Security Breach Detected</span>
                <span class="toast-msg">${latestReading.device_name} opened at ${latestReading.location}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        toastContainer.appendChild(toast);

        // Auto-remove the toast after 10 seconds to keep the screen clean
        setTimeout(() => {
            if(toast.parentElement) toast.remove();
        }, 10000);
    }
}

// --- 🛠️ REGISTRATION MODAL LOGIC ---
function toggleModal(show) {
    document.getElementById('reg-modal').style.display = show ? 'flex' : 'none';
    if (!show) {
        // Clear inputs on close so it's empty the next time they open it
        document.getElementById('reg-id').value = '';
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-loc').value = '';
    }
}

async function submitRegistration() {
    const device_id = document.getElementById('reg-id').value.trim();
    const device_name = document.getElementById('reg-name').value.trim();
    const location = document.getElementById('reg-loc').value;

    if (!device_id || !device_name || !location) {
        alert("Please fill out all fields and select a building.");
        return;
    }

    try {
        const res = await fetch('/api/iot/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ device_id, device_name, location })
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Sensor Registered Successfully!");
            toggleModal(false); // Close the popup
            fetchSensorData(); // Refresh the dashboard immediately to show the new device
        } else {
            alert(`❌ Error: ${data.error}`);
        }
    } catch (err) {
        alert("Failed to reach the server.");
    }
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

// --- 🎛️ UPGRADED CONTROL PANEL RENDERING ---
function renderControlPanel(logs) {
    const deviceList = document.getElementById('device-list');
    const uniqueDevices = {};
    
    // Extract unique devices and their CURRENT alarm state
    logs.forEach(log => {
        if (!uniqueDevices[log.device_id]) {
            uniqueDevices[log.device_id] = { 
                name: log.device_name, 
                loc: log.location,
                alarm_active: log.alarm_active 
            };
        }
    });

    deviceList.innerHTML = '';
    
    for (const [id, info] of Object.entries(uniqueDevices)) {
        // Change button color based on whether the alarm is currently ON or OFF
        const btnColor = info.alarm_active ? '#ef4444' : '#e2e8f0';
        const btnText = info.alarm_active ? '🚨 ALARM ACTIVE (Click to Turn Off)' : 'Trigger Alarm';
        const textColor = info.alarm_active ? 'white' : '#475569';

        deviceList.innerHTML += `
            <div class="device-row">
                <div class="device-info">
                    <h4>${info.name}</h4>
                    <p>ID: ${id} | ${info.loc}</p>
                </div>
                <button onclick="toggleDeviceAlarm('${id}', ${!info.alarm_active})" 
                        style="background: ${btnColor}; color: ${textColor}; border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                    ${btnText}
                </button>
            </div>
        `;
    }
}

// --- 🚨 THE COMMAND SENDER ---
async function toggleDeviceAlarm(deviceId, turnOn) {
    try {
        const res = await fetch('/api/iot/toggle-alarm', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ device_id: deviceId, alarm_active: turnOn })
        });

        if (res.ok) {
            fetchSensorData(); // Instantly refresh the UI to show the new button color
        } else {
            alert("Failed to send command to the device.");
        }
    } catch (error) {
        console.error("Command Error:", error);
    }
}

// Initial load and then refresh every 5 seconds
fetchSensorData();
setInterval(fetchSensorData, 5000);