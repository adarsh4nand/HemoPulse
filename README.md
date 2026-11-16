# 🩸 HemoPulse: Smart Blood Bank & Donation Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HemoPulse** is a centralized, paperless, and AI-assisted web platform designed to bridge the critical demand-supply gap in India's blood banking ecosystem. It digitizes donor registration, automates medical yield calculations, provides real-time cross-location inventory visibility, and ensures a secure, auditable trail for regulatory compliance.

> 🎯 **Targeting SDG 3:** Good Health and Well-being. Specifically addressing the "blood desert" crisis in rural and semi-urban India.

---

## 🌟 Key Features

### 🧪 Automated Component Yield Calculator
Replaces manual ledger entries. When a donor gives 1 unit of Whole Blood, the system automatically calculates and splits the inventory into RBC, Plasma, and Platelets based on medical standards.

### 📱 QR Code Audit Trail
Generates a unique, scannable QR code for every blood unit. Hospital staff can scan the code to instantly view the unit's complete digital audit trail (Donor ID, Collection Date, Expiry, Component Type).

### 🤖 NLP Donor Assistant
A smart, rule-based AI chatbot that answers donor queries regarding eligibility, the 90-day gap rule, hemoglobin limits, and health screening in real-time.

### 🚨 Blood SOS Emergency Alerts
A dedicated emergency module for hospitals to instantly alert all eligible, registered donors of a specific rare blood group in the network.

### 📊 Pro Community Dashboard
Real-time data visualization showing total donors, lives saved, inventory distribution pie charts, and a live audit trail of recent donations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js (Vite), Recharts, Lucide-React, QRCode.react |
| **Backend** | Python Flask (RESTful APIs) |
| **Database** | SQLite (zero-config, file-based) |
| **Tools** | Git, GitHub, Postman |

---

## 📂 Project Structure

```text
HemoPulse/
├── backend/
│   ├── app/
│   │   ├── __init__.py      # Flask app initialization
│   │   ├── database.py      # MySQL connection logic
│   │   └── routes.py        # REST API endpoints
│   ├── config.py            # Database credentials
│   └── run.py               # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── App.jsx          # Main routing/layout
│   │   └── App.css          # Global modern UI styles
│   └── package.json
├── database/
│   └── schema.sql           # Database initialization script
└── README.md
```

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- ⚠️ **No MySQL required!** HemoPulse uses SQLite, which is built into Python.

### 1. Database Setup
Open your terminal, navigate to the backend folder, and run this single command to generate the database and tables automatically:

    cd backend
    python init_db.py

*(This creates a local `hemopulse.db` file with sample data. No database server needed!)*

### 2. Backend Setup (Flask)
Still in the `backend` folder, set up your virtual environment and start the server:

    python -m venv venv

    # For Windows:
    .\venv\Scripts\activate

    # For Mac/Linux:
    source venv/bin/activate

    pip install -r requirements.txt
    python run.py

*(The server will start on http://127.0.0.1:5000)*

### 3. Frontend Setup (React)
Open a **new** terminal window and navigate to the frontend folder:

    cd frontend
    npm install
    npm run dev

*(The app will automatically open in your browser at http://localhost:5173)*