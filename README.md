# Smart Campus Safety System (SCSS)

# Smart Campus Safety System (SCSS)

A centralized campus security platform integrating real-time IoT monitoring with a user-friendly incident reporting portal. Developed as a Final Year Project for the BSc (Hons) Applied Computing program at the University of Huddersfield.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Programming Languages](#programming-languages)
- [Key Features](#key-features)
A centralized campus security platform integrating real-time IoT monitoring with a user-friendly incident reporting portal. Developed as a Final Year Project for the BSc (Hons) Applied Computing program at the University of Huddersfield.

---

## Table of Contents
- [Overview](#overview)
- [What's in this repo](#whats-in-this-repo)
- [Server & API overview](#server--api-overview)
- [ESP32 firmware notes](#esp32-firmware-notes)
- [Local setup](#local-setup)
- [Database & seeding](#database--seeding)
- [Uploads & file handling](#uploads--file-handling)
- [Background jobs](#background-jobs)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## Overview
SCSS combines ESP32 sensor firmware with a Node.js + Express backend and a simple browser UI (under `public/`) to provide:
- IoT sensor logging (temperature, humidity, door open/closed)
- Incident reporting and image uploads
- Direct messaging between users and the security team

## What's in this repo
- `server.js` — Express server and route mounting (`/api/auth`, `/api/iot`, `/api/chat`) and a health route `/api/health`.
- `config/database.js` — MySQL connection pool (uses `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- `controllers/` — `authController.js`, `iotController.js`, `chatController.js` implementing the core API logic.
- `routes/` — route definitions: `authRoutes.js`, `iotRoutes.js`, `chatRoutes.js`.
- `middleware/` — `auth.js` (JWT `Authorization: Bearer <token>`), `iotAuth.js` (expects `x-api-key` header), `upload.js` (multer config for images).
- `public/` and `old-simple-ui/` — simple frontend pages and client JS for IoT dashboard and auth flows.
- `esp32-code/` and `no_wifi_code_to_test_the_circuit/` — ESP32 sketches that POST sensor data to the server.
- `scripts/seedSecurity.js` — seeds a centralized security account.
- `services/cronJobs.js` — nightly pruning task.

## Server & API overview
The server exposes the following endpoints (see `routes/*` and `controllers/*`):
- `POST /api/auth/register` — register a user (`authController.register`).
- `POST /api/auth/login` — login and receive a JWT (`authController.login`).
- `POST /api/iot/log` — used by ESP32 devices to POST sensor readings; protected by `x-api-key` (`iotAuth.verifyIotKey`) and handled by `iotController.logSensorData`.
- `GET /api/iot/data` — returns recent sensor logs for the dashboard; requires JWT (`auth.verifyToken`) and uses `iotController.getLatestData`.
- `POST /api/iot/register` — register a new device (requires JWT) (`iotController.registerDevice`).
- `POST /api/iot/toggle-alarm` — change a device's `alarm_active` flag (requires JWT) (`iotController.toggleAlarm`).
- `POST /api/chat/send` — send a message with optional image (JWT + `multer` middleware) (`chatController.sendMessage`).
- `GET /api/chat/history` — fetch conversation history for logged-in user (`chatController.getChatHistory`).
- `GET /api/chat/active-users` — list active users who chatted with security (`chatController.getActiveUsers`).
- `DELETE /api/chat/delete-chat` — delete chat history and attached images for the logged-in user (`chatController.deleteChatHistory`).

Authentication & middleware notes:
- JWTs are verified by `middleware/auth.js`; tokens are expected in the `Authorization` header as `Bearer <token>`.
- IoT devices must send `x-api-key` matching `process.env.IOT_API_KEY` (see `middleware/iotAuth.js`).

Static serving:
- `public/` is served at `/public` and `uploads/` is served at `/uploads` from `server.js`.

## ESP32 firmware notes
Files under `esp32-code/` and `no_wifi_code_to_test_the_circuit/` show how devices POST data:
- POST target: `/api/iot/log` (e.g. `http://<server>:3000/api/iot/log`).
- Required header: `x-api-key` with the device API key (compared against `IOT_API_KEY` in `.env`).
- JSON payload fields sent by firmware: `device_id`, `temperature`, `humidity`, `door_status`.

Behavior visible in the firmware and controller:
- The server responds to the device with a `command` object (e.g. `{ command: { sound_alarm: true } }`) which the firmware uses to toggle a buzzer.
- The sketch includes local logic for determining `OPEN` vs `CLOSED` using an ultrasonic sensor and sends periodic POSTs (see `no_wifi_code_to_test_the_circuit/`).

## Local setup
1. Install dependencies:

```bash
npm install
```

2. Environment variables (create `.env` in project root):

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=scss_db
JWT_SECRET=your_jwt_secret
PORT=3000
IOT_API_KEY=your_iot_api_key
```

3. Start server:

```bash
npm start          # production start
npm run dev        # development with nodemon
```

4. Seed the centralized security account (optional):

```bash
node scripts/seedSecurity.js
```

## Database & seeding
- `config/database.js` creates a MySQL pool and attempts a connection on startup; errors will be logged to console.
- `scripts/seedSecurity.js` inserts a `security_admin` account (the script hashes the password `'SuperSecurePassword123'` before inserting).

## Uploads & file handling
- File uploads are handled by `middleware/upload.js` using `multer` and stored in the `uploads/` folder. Only images are accepted.
- `chatController.deleteChatHistory` removes associated image files from `uploads/` when deleting chat history.

## Background jobs
- `services/cronJobs.js` schedules a nightly pruning job (`0 2 * * *` — 2:00 AM) that deletes `sensor_logs` where `door_status = 'CLOSED'` and `logged_at` is older than 7 days.

## Scripts
- `npm start` — runs `node server.js`.
- `npm run dev` — runs `nodemon server.js` for development.
- `node scripts/seedSecurity.js` — seeds a security account.

## Troubleshooting
- Database connection failed on startup: check `.env` DB variables and ensure MySQL is running (see `config/database.js` logs).
- ESP32 cannot POST: verify `IOT_API_KEY`, the device `serverUrl` in the sketch, and that the server is reachable from the device network.
- Uploaded images missing: confirm `uploads/` exists (the upload middleware ensures it is created) and file permissions are correct.

## Author
Final Year Project — BSc (Hons) Applied Computing, University of Huddersfield

4. Update WiFi credentials in `config.h`
5. Select ESP32 board and COM port
6. Upload firmware using **Sketch > Upload** or `platformio run --target upload`
7. Verify sensor connections and serial monitor output

## Testing
Run the test suite:

```bash
npm test
```

For integration tests with ESP32 simulation:

```bash
npm run test:integration
```

## API Documentation
Comprehensive API endpoint documentation is available at `/docs/API.md` or visit http://localhost:3000/api-docs when the server is running.

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Database connection fails | Verify MySQL is running and credentials in `.env` are correct |
| ESP32 won't upload | Check USB drivers installed and correct COM port selected |
| Sensors not responding | Verify wiring and power supply to ESP32 |
| Port 3000 already in use | Change PORT in `.env` or kill existing process |
| JWT authentication errors | Regenerate JWT_SECRET in `.env` and clear browser cookies |

## Author
Author: Final Year Project — BSc (Hons) Applied Computing, University of Huddersfield
