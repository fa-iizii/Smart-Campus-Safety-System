# Smart Campus Safety System (SCSS)

**A centralized campus security platform integrating real-time IoT monitoring with a user-friendly incident reporting portal.** Developed as a Final Year Project for the BSc (Hons) Applied Computing program at the University of Huddersfield.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Author](#author)

---

## 🎯 Project Overview
The Smart Campus Safety System (SCSS) is designed to streamline campus security operations. It bridges the gap between automated physical security and human reporting by combining hardware sensors (ESP32) with a web-based portal. This allows the centralized security team to monitor fire exit statuses in real-time while processing user-submitted incident reports and direct messages.

The system strictly prioritizes a clean, functional UI to ensure high usability during critical safety situations.

## ✨ Key Features
* **IoT Monitoring:** Real-time tracking of fire exit doors (Open/Closed status via distance sensors) and environmental tracking (DHT11 Temperature & Humidity).
* **Role-Based Access Control (RBAC):** Secure separation between standard users (students/employees) and the centralized security team.
* **Incident Reporting:** Users can submit detailed safety reports including location, severity level, and photo evidence.
* **Direct Messaging:** A built-in chat interface for direct communication between users and the security team.

## 💻 Tech Stack
* **Backend Environment:** Node.js, Express.js
* **Database:** MySQL (via `mysql2` promise wrapper)
* **Authentication & Security:** JSON Web Tokens (JWT), `bcrypt`
* **File Handling:** `multer` (for image uploads)
* **IoT Hardware:** ESP32, DHT11 Sensor, Ultrasonic Distance Sensor

## ⚙️ Prerequisites
Before running this project, ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/Smart-Campus-Safety-System.git](https://github.com/yourusername/Smart-Campus-Safety-System.git)
cd Smart-Campus-Safety-System