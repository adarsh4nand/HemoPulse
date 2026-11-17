import sqlite3
import os
from werkzeug.security import generate_password_hash

# Create the database file in the backend folder
db_path = os.path.join(os.path.dirname(__file__), 'hemopulse.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create Users table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Create Donors table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Donors (
        donor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        blood_group TEXT NOT NULL,
        last_donation_date DATE,
        is_eligible INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Create BloodInventory table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS BloodInventory (
        unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        blood_group TEXT NOT NULL,
        component_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        expiry_date DATE NOT NULL,
        status TEXT DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Add some dummy data for the dashboard
cursor.execute("INSERT OR IGNORE INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES ('O+', 'Whole Blood', 10, '2026-12-31')")
cursor.execute("INSERT OR IGNORE INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES ('A-', 'Plasma', 5, '2026-11-15')")

# Insert default admin user
admin_hash = generate_password_hash('admin123')
cursor.execute("INSERT OR IGNORE INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
               ('Admin', 'admin@hemopulse.com', admin_hash, 'admin'))

conn.commit()
conn.close()
print("✅ Database 'hemopulse.db' created successfully!")