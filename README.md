# Smart Campus Safety System (SCSS)

# Smart Campus Safety System (SCSS)

A centralized campus security platform integrating real-time IoT monitoring with a user-friendly incident reporting portal. Developed as a Final Year Project for the BSc (Hons) Applied Computing program at the University of Huddersfield.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Programming Languages](#programming-languages)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Installation & Setup](#installation--setup)
- [ESP32 Setup Guide](#esp32-setup-guide)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## Project Overview
The Smart Campus Safety System (SCSS) is designed to streamline campus security operations. It combines ESP32-based hardware sensors with a web portal so the centralized security team can monitor fire-exit statuses in real time, process user-submitted incident reports, and handle direct messages.

The system emphasizes a clean, functional UI for high usability during safety incidents.

## Programming Languages
- **JavaScript (Node.js):** Backend server and business logic
- **JavaScript (Frontend):** Client-side interactivity and user interface
- **SQL:** Database queries and data management
- **C/C++:** ESP32 microcontroller firmware

## Key Features
- **IoT Monitoring:** Real-time tracking of fire-exit doors (open/closed via distance sensors) and environmental data (DHT11 temperature & humidity)
- **Role-Based Access Control (RBAC):** Separation between standard users and the centralized security team
- **Incident Reporting:** Submit detailed safety reports with location, severity, and photo evidence
- **Direct Messaging:** Chat interface for communication between users and security

## Tech Stack
- **Backend:** Node.js with Express
- **Database:** MySQL (with `mysql2` promise wrapper)
- **Authentication:** JWT and `bcrypt` for password hashing
- **File Handling:** `multer` for image uploads
- **IoT Hardware:** ESP32, DHT11, ultrasonic distance sensor

## Prerequisites
Ensure the following are installed:
- Node.js v14 or higher
- MySQL Server 5.7 or higher
- Git (recommended)
- A code editor such as Visual Studio Code (optional)

## Getting Started
1. Clone the repository:

```bash
git clone https://github.com/yourusername/Smart-Campus-Safety-System.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure a `.env` file with your database credentials.

4. Run migrations (if provided) and start the server:

```bash
npm run migrate
npm start
```

5. Open the application at http://localhost:3000

## Installation & Setup

### 1. Clone the repository
Run:

```bash
git clone https://github.com/yourusername/Smart-Campus-Safety-System.git
cd Smart-Campus-Safety-System
```

### 2. Install dependencies
Run:

```bash
npm install
```

### 3. Configure the database
Create a MySQL database and user (example):

```sql
CREATE DATABASE scss_db;
CREATE USER 'scss_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON scss_db.* TO 'scss_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Environment configuration
Create a `.env` file in the project root with the following variables:

```
DB_HOST=localhost
DB_USER=scss_user
DB_PASSWORD=your_secure_password
DB_NAME=scss_db
JWT_SECRET=your_secret_key_here
PORT=3000
```

### 5. Run the application
Start the Node.js server:

```bash
npm start
```

The application will be accessible at http://localhost:3000

## ESP32 Setup Guide
1. Install Arduino IDE or PlatformIO
2. Add ESP32 board support via the Board Manager
3. Navigate to `/firmware` directory
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
