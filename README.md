# Smart Campus Safety System (SCSS)

Smart Campus Safety System (SCSS) centralizes campus safety monitoring by combining IoT sensor data (ESP32) with a web-based incident reporting and messaging portal. This project was developed as a final-year project for BSc (Hons) Applied Computing at the University of Huddersfield.

## Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [ESP32 Firmware Setup](#esp32-firmware-setup)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Author](#author)

## Overview
SCSS monitors fire-exit doors (open/closed) and environmental data (temperature, humidity) from ESP32-based sensors and provides a web portal for users and the security team to report incidents, attach photos, and exchange messages.

## Features
- Real-time IoT monitoring (door status, DHT11 readings)
- Role-based access: users and security team
- Incident reporting with photo uploads
- Direct messaging between users and security

## Tech Stack
- Backend: Node.js, Express
- Database: MySQL with `mysql2` (promise wrapper)
- Auth: JWT and `bcrypt` for password hashing
- File uploads: `multer`
- IoT: ESP32 microcontroller, DHT11, ultrasonic distance sensor

## Prerequisites
- Node.js v14+ installed
- MySQL Server (5.7+) running
- Git (recommended)

## Quick Start
1. Clone the repo:

```bash
git clone https://github.com/yourusername/Smart-Campus-Safety-System.git
cd Smart-Campus-Safety-System
```

2. Install dependencies:

```bash
npm install
```

3. Create a MySQL database and user (adjust names/passwords):

```sql
CREATE DATABASE scss_db;
CREATE USER 'scss_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON scss_db.* TO 'scss_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Add `.env` in the project root with:

```
DB_HOST=localhost
DB_USER=scss_user
DB_PASSWORD=your_secure_password
DB_NAME=scss_db
JWT_SECRET=your_secret_key_here
PORT=3000
```

5. Run migrations (if provided) and start the server:

```bash
npm run migrate  # if applicable
npm start
```

6. Open the app at http://localhost:3000

## ESP32 Firmware Setup
1. Install Arduino IDE or PlatformIO and add ESP32 board support.
2. Open the `esp32-code/esp32-code.ino` (or firmware folder) and update Wi‑Fi credentials.
3. Select the target ESP32 board and correct COM port.
4. Upload the sketch and monitor serial output to verify sensor readings.

## Testing
- Unit/integration tests:

```bash
npm test
```

## API Documentation
API docs are available in `/docs/API.md` or at `http://localhost:3000/api-docs` when the server is running.

## Troubleshooting
- Database connection fails: ensure MySQL is running and `.env` credentials are correct.
- ESP32 upload fails: check USB drivers and COM port.
- Sensors not responding: verify wiring and power.
- Port 3000 in use: change `PORT` in `.env` or stop the conflicting process.

## Contributing
Contributions and improvements are welcome. Open issues or PRs describing the change.

## Author
Final-year project by the author (University of Huddersfield).
